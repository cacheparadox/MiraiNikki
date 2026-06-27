import { CompilerTelemetry } from '../telemetry/CompilerTelemetry';

export interface RawAITask {
  title: string;
  sentenceId: string;
  estimatedMinutes?: number;
  category?: string;
}

export interface RawAIResponse {
  version: string;
  tasks: RawAITask[];
}

export class Validator {
  static async parseAndValidate(jsonString: string): Promise<RawAIResponse> {
    await CompilerTelemetry.info('Validator', 'Parsing AI JSON response');
    
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      await CompilerTelemetry.error('Validator', 'Invalid JSON from AI', { error: String(e) });
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI response is not a JSON object');
    }

    if (!parsed.version) {
      await CompilerTelemetry.warn('Validator', 'Missing version in AI response');
    }

    if (!Array.isArray(parsed.tasks)) {
      throw new Error('AI response missing tasks array');
    }

    const validTasks = parsed.tasks.filter((t: any) => {
      if (!t.title || typeof t.title !== 'string') return false;
      if (!t.sentenceId || typeof t.sentenceId !== 'string') return false;
      return true;
    });

    if (validTasks.length !== parsed.tasks.length) {
      await CompilerTelemetry.warn('Validator', `Dropped ${parsed.tasks.length - validTasks.length} invalid tasks from AI response`);
    }

    return {
      version: String(parsed.version || '1'),
      tasks: validTasks,
    };
  }
}
