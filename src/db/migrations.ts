import { db } from './database';

export function runMigrations() {
  db.version(1).stores({
    journals: 'id, createdAt, unlockAt, status', 
    tasks: 'id, journalId, title, completed',
    settings: 'id',
    drafts: 'id',
    queue: 'id, journalId, status, nextRetryAt',
    logs: 'id, timestamp, level, component'
  });
}
