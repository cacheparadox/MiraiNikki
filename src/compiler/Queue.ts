import { db } from '../db/database';
import { type QueueEntry, QueueStatus } from '../types';
import { CompilerTelemetry } from '../telemetry/CompilerTelemetry';

export class Queue {
  static async add(journalId: string, provider: string, model: string): Promise<QueueEntry> {
    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      journalId,
      attempts: 0,
      status: QueueStatus.Pending,
      provider,
      model,
    };
    await db.queue.put(entry);
    await CompilerTelemetry.info('Queue', `Added journal ${journalId} to compilation queue`);
    return entry;
  }

  static async getNextPending(): Promise<QueueEntry | undefined> {
    const now = new Date().toISOString();
    
    // Find all that are Pending, or WaitingRetry where nextRetryAt is <= now
    const candidates = await db.queue
      .filter(item => {
        if (item.status === QueueStatus.Pending) return true;
        if (item.status === QueueStatus.WaitingRetry && item.nextRetryAt && item.nextRetryAt <= now) return true;
        return false;
      })
      .toArray();

    // Prioritize oldest
    if (candidates.length > 0) {
      return candidates.sort((a, b) => a.id.localeCompare(b.id))[0]; 
      // Ideally we sort by creation, but for simple queue ID is fine, or we can just pick the first.
    }
    return undefined;
  }

  static async markRunning(id: string): Promise<void> {
    await db.queue.update(id, { status: QueueStatus.Running, lastAttempt: new Date().toISOString() });
    await CompilerTelemetry.info('Queue', `Marked ${id} as Running`);
  }

  static async markFailed(id: string, attempts: number): Promise<void> {
    const MAX_ATTEMPTS = 5;
    if (attempts >= MAX_ATTEMPTS) {
      await db.queue.update(id, { status: QueueStatus.Failed });
      await CompilerTelemetry.error('Queue', `Task ${id} failed permanently after ${attempts} attempts`);
      return;
    }

    // Exponential backoff: 1m, 2m, 4m, 8m...
    const backoffMinutes = Math.pow(2, attempts - 1);
    const nextRetry = new Date();
    nextRetry.setMinutes(nextRetry.getMinutes() + backoffMinutes);

    await db.queue.update(id, { 
      status: QueueStatus.WaitingRetry, 
      attempts, 
      nextRetryAt: nextRetry.toISOString() 
    });
    await CompilerTelemetry.warn('Queue', `Task ${id} failed, will retry at ${nextRetry.toISOString()}`);
  }

  static async remove(id: string): Promise<void> {
    await db.queue.delete(id);
    await CompilerTelemetry.info('Queue', `Removed ${id} from queue (Succeeded)`);
  }

  static async resetStuckTasks(): Promise<void> {
    const stuck = await db.queue.where('status').equals(QueueStatus.Running).toArray();
    for (const item of stuck) {
      await db.queue.update(item.id, { status: QueueStatus.Pending });
      await CompilerTelemetry.warn('Queue', `Reset stuck task ${item.id} from Running to Pending`);
    }
  }
}
