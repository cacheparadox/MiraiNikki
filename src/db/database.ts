import Dexie, { type Table } from 'dexie';
import type { JournalEntry, Task, AppSettings, Draft, QueueEntry, TelemetryLog } from '../types';

export class MiraiNikkiDB extends Dexie {
  journals!: Table<JournalEntry, string>;
  tasks!: Table<Task, string>;
  settings!: Table<AppSettings, string>;
  drafts!: Table<Draft, string>;
  queue!: Table<QueueEntry, string>;
  logs!: Table<TelemetryLog, string>;

  constructor() {
    super('MiraiNikkiDB');
  }
}

export const db = new MiraiNikkiDB();
