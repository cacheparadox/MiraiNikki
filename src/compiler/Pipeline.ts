import { db } from '../db/database';
import { Queue } from './Queue';
import { Validator } from './Validator';
import { Rules } from './Rules';
import { Normalizer } from './Normalizer';
import { OpenRouterProvider } from '../providers/OpenRouterProvider';
import { FUTURE_COMPILER_SYSTEM_PROMPT, COMPILER_PROMPT_VERSION } from '../prompts/futureCompiler';
import { segmentText } from '../utils/segmenter';
import { JournalStatus } from '../types';
import { CompilerTelemetry } from '../telemetry/CompilerTelemetry';

export class Pipeline {
  static async processNextInQueue(): Promise<boolean> {
    const item = await Queue.getNextPending();
    if (!item) return false;

    await Queue.markRunning(item.id);
    await CompilerTelemetry.info('Pipeline', `Starting compilation for journal ${item.journalId}`);

    try {
      const journal = await db.journals.get(item.journalId);
      if (!journal) {
        await CompilerTelemetry.warn('Pipeline', `Journal ${item.journalId} not found, removing from queue`);
        await Queue.remove(item.id);
        return true;
      }

      const settings = await db.settings.get('singleton');
      if (!settings || !settings.aiApiKey) {
        throw new Error('AI Provider not configured or missing API key');
      }

      // Step 1: Pre-process (Segmenter + Normalizer UUID prep)
      const segments = segmentText(journal.content);
      const { promptText, map } = Normalizer.preparePrompt(segments);

      // Step 2: AI Provider execution
      const provider = new OpenRouterProvider(); 
      await CompilerTelemetry.info('Pipeline', 'Sending prompt to AI Provider');
      const response = await provider.compileJournal(
        FUTURE_COMPILER_SYSTEM_PROMPT,
        promptText,
        settings.aiApiKey,
        item.model,
        settings.baseUrl
      );

      // Step 3: Layered Validation
      const rawJson = await Validator.parseAndValidate(response.content);
      
      // Step 4: Business Rules
      const ruledJson = await Rules.apply(rawJson);

      // Step 5: Normalization (Restore UUIDs)
      const finalTasks = await Normalizer.finalize(journal.id, ruledJson, map);

      // Step 6: Commit to Database
      await CompilerTelemetry.info('Pipeline', `Successfully compiled ${finalTasks.length} tasks`);
      await db.tasks.bulkPut(finalTasks);
      
      await db.journals.update(journal.id, {
        status: JournalStatus.Ready,
        compilerStatus: 'Success',
        compiledAt: new Date().toISOString(),
        promptVersion: COMPILER_PROMPT_VERSION,
        provider: provider.name,
        model: response.model,
      });

      await Queue.remove(item.id);
      return true;

    } catch (e: any) {
      await CompilerTelemetry.error('Pipeline', `Compilation failed: ${e.message}`, { error: String(e) });
      
      // Update journal status so UI knows it's broken
      await db.journals.update(item.journalId, { compilerStatus: `Error: ${e.message}` });
      
      await Queue.markFailed(item.id, item.attempts + 1);
      return true;
    }
  }
}
