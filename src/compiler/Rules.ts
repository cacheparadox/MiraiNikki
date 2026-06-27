import type { RawAIResponse, RawAITask } from './Validator';
import { TaskCategory } from '../types';
import { CompilerTelemetry } from '../telemetry/CompilerTelemetry';

export class Rules {
  static async apply(raw: RawAIResponse): Promise<RawAIResponse> {
    await CompilerTelemetry.info('Rules', 'Applying business rules');
    
    // De-dupe by title (case insensitive)
    const seenTitles = new Set<string>();
    const uniqueTasks: RawAITask[] = [];

    for (const task of raw.tasks) {
      const lowerTitle = task.title.trim().toLowerCase();
      if (seenTitles.has(lowerTitle)) continue;
      seenTitles.add(lowerTitle);
      uniqueTasks.push(task);
    }

    // Limit to 30 tasks
    let clampedTasks = uniqueTasks;
    if (clampedTasks.length > 30) {
      await CompilerTelemetry.warn('Rules', 'Task count exceeded 30, truncating');
      clampedTasks = clampedTasks.slice(0, 30);
    }

    // Apply specific rules to each task
    const finalizedTasks = clampedTasks.map(task => {
      // Clamp estimated minutes between 5 and 480
      let minutes = task.estimatedMinutes;
      if (typeof minutes === 'number') {
        if (minutes < 5) minutes = 5;
        if (minutes > 480) minutes = 480;
      } else {
        minutes = 15; // default fallback
      }

      // Enforce Category Enum
      let category = TaskCategory.Other;
      if (task.category && Object.values(TaskCategory).includes(task.category as TaskCategory)) {
        category = task.category as TaskCategory;
      }

      return {
        ...task,
        title: task.title.trim(),
        estimatedMinutes: minutes,
        category
      };
    });

    return {
      version: raw.version,
      tasks: finalizedTasks
    };
  }
}
