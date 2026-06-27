import { create } from 'zustand';
import { type JournalEntry, JournalStatus } from '../types';
import { db } from '../db/database';

interface ArchiveState {
  archivedJournals: JournalEntry[];
  loadArchive: () => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  archivedJournals: [],

  loadArchive: async () => {
    const archives = await db.journals
      .where('status')
      .equals(JournalStatus.Archived)
      .reverse()
      .sortBy('createdAt');
    
    set({ archivedJournals: archives });
  },

  deleteJournal: async (id: string) => {
    await db.journals.delete(id);
    await db.tasks.where('journalId').equals(id).delete();
    const { archivedJournals } = get();
    set({ archivedJournals: archivedJournals.filter(j => j.id !== id) });
  }
}));
