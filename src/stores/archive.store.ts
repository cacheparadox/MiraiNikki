import { create } from 'zustand';
import { type JournalEntry, type Task, JournalStatus } from '../types';
import { db } from '../db/database';

interface MonthGroup {
  month: string; // e.g. "June 2026"
  entries: (JournalEntry & { taskSummary?: { total: number; completed: number } })[];
}

interface ArchiveState {
  archivedJournals: JournalEntry[];
  monthGroups: MonthGroup[];
  selectedJournal: JournalEntry | null;
  selectedTasks: Task[];
  loadArchive: () => Promise<void>;
  loadArchiveDetail: (id: string) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  archivedJournals: [],
  monthGroups: [],
  selectedJournal: null,
  selectedTasks: [],

  loadArchive: async () => {
    // Get all journals that are Opened or Archived
    const all = await db.journals.toArray();
    const archivable = all.filter(j =>
      j.status === JournalStatus.Archived ||
      j.status === JournalStatus.Opened
    );

    // Sort newest first
    archivable.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get task summaries for each
    const enriched = await Promise.all(
      archivable.map(async (j) => {
        const tasks = await db.tasks.where('journalId').equals(j.id).toArray();
        return {
          ...j,
          taskSummary: {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
          }
        };
      })
    );

    // Group by month
    const groups: Record<string, typeof enriched> = {};
    for (const entry of enriched) {
      const date = new Date(entry.createdAt);
      const monthKey = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(entry);
    }

    const monthGroups: MonthGroup[] = Object.entries(groups).map(([month, entries]) => ({
      month,
      entries,
    }));

    set({ archivedJournals: archivable, monthGroups });
  },

  loadArchiveDetail: async (id: string) => {
    const journal = await db.journals.get(id);
    if (!journal) return;

    const tasks = await db.tasks.where('journalId').equals(id).toArray();
    set({ selectedJournal: journal, selectedTasks: tasks });
  },

  deleteJournal: async (id: string) => {
    await db.journals.delete(id);
    await db.tasks.where('journalId').equals(id).delete();
    const { archivedJournals } = get();
    set({ archivedJournals: archivedJournals.filter(j => j.id !== id) });
    get().loadArchive(); // Refresh month groups
  },
}));
