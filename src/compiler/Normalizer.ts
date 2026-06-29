import type { RawAIResponse } from './Validator';
import { type Task, TaskCategory } from '../types';
import { CompilerTelemetry } from '../telemetry/CompilerTelemetry';

export class Normalizer {
  /**
   * Pre-compilation: Creates a prompt string using aliases (S1, S2) and stores the UUID mapping.
   */
  static preparePrompt(sentences: { id: string; text: string }[]): { promptText: string; map: Record<string, string> } {
    const map: Record<string, string> = {}; // alias -> UUID
    let promptText = '';

    sentences.forEach((s, i) => {
      const alias = `S${i + 1}`;
      map[alias] = s.id;
      promptText += `${alias}. ${s.text}\n`;
    });

    return { promptText, map };
  }

  /**
   * Post-compilation: Replaces aliases with original UUIDs and structures final Task objects.
   */
  static async finalize(journalId: string, raw: RawAIResponse, aliasToUuidMap: Record<string, string>): Promise<Task[]> {
    await CompilerTelemetry.info('Normalizer', 'Finalizing tasks and restoring UUID mappings');
    
    const finalTasks: Task[] = [];

    for (const rawTask of raw.tasks) {
      const sentenceUuid = aliasToUuidMap[rawTask.sentenceId];
      if (!sentenceUuid) {
        await CompilerTelemetry.warn('Normalizer', `AI returned invalid alias: ${rawTask.sentenceId}`);
        continue;
      }

      finalTasks.push({
        id: crypto.randomUUID(),
        journalId,
        title: rawTask.title,
        completed: false,
        category: (rawTask.category as TaskCategory) || TaskCategory.Other,
        estimatedMinutes: rawTask.estimatedMinutes || 15,
        sentenceId: sentenceUuid,
        order: finalTasks.length,
      });
    }

    return finalTasks;
  }
}
