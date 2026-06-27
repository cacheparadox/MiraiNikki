import { create } from 'zustand';
import { type QueueEntry, QueueStatus, JournalStatus } from '../types';
import { db } from '../db/database';
import { CompilerEngine } from '../compiler/CompilerEngine';

interface CompilerState {
  queueItems: QueueEntry[];
  isCompiling: boolean;
  loadQueue: () => Promise<void>;
  cancelCompilation: (journalId: string) => Promise<void>;
  recompileJournal: (journalId: string) => Promise<void>;
  setCompiling: (compiling: boolean) => void;
}

export const useCompilerStore = create<CompilerState>((set, get) => ({
  queueItems: [],
  isCompiling: false,

  loadQueue: async () => {
    const queue = await db.queue.toArray();
    set({ queueItems: queue });
  },

  cancelCompilation: async (journalId: string) => {
    const items = await db.queue.where('journalId').equals(journalId).toArray();
    for (const item of items) {
      await db.queue.update(item.id, { status: QueueStatus.Failed });
    }
    
    const journal = await db.journals.get(journalId);
    if (journal) {
      await db.journals.update(journalId, { compilerStatus: 'Error: Compilation cancelled by user' });
    }
    
    get().loadQueue();
  },

  recompileJournal: async (journalId: string) => {
    const journal = await db.journals.get(journalId);
    if (!journal) return;

    const existing = await db.queue.where('journalId').equals(journalId).toArray();
    for (const item of existing) {
      await db.queue.delete(item.id);
    }

    const settings = await db.settings.get('singleton');
    
    await db.queue.put({
      id: crypto.randomUUID(),
      journalId,
      attempts: 0,
      status: QueueStatus.Pending,
      provider: settings?.aiProvider || 'OpenRouter',
      model: settings?.aiModel || 'google/gemini-2.5-flash-pro',
    });

    await db.journals.update(journalId, { 
      compilerStatus: 'In Queue',
      status: JournalStatus.PendingCompilation
    });
    
    get().loadQueue();
    CompilerEngine.trigger();
  },

  setCompiling: (compiling: boolean) => {
    set({ isCompiling: compiling });
  }
}));
