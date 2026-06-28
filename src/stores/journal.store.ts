import { create } from 'zustand';
import { type JournalEntry, type Task, JournalStatus, TaskCategory, type SentenceMapping } from '../types';
import { db } from '../db/database';

interface JournalState {
  todayJournal: JournalEntry | null;
  tasks: Task[];
  loadTodayJournal: () => Promise<void>;
  sealJournal: (content: string, unlockTime: string) => Promise<void>;
  openJournal: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  uncompleteTask: (taskId: string) => Promise<void>;
  addTask: (journalId: string, title: string, category?: TaskCategory) => Promise<void>;
  storeSentenceMap: (journalId: string, map: SentenceMapping[]) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  todayJournal: null,
  tasks: [],

  loadTodayJournal: async () => {
    const journals = await db.journals.orderBy('createdAt').reverse().toArray();
    const active = journals.find(j => j.status !== JournalStatus.Archived);

    if (active) {
      const tasks = await db.tasks.where('journalId').equals(active.id).toArray();
      set({ todayJournal: active, tasks });
    } else {
      set({ todayJournal: null, tasks: [] });
    }
  },

  sealJournal: async (content: string, unlockTime: string = '04:00') => {
    const journalId = crypto.randomUUID();
    const now = new Date();

    // Parse unlock time from settings
    const [hours, minutes] = unlockTime.split(':').map(Number);
    const unlockDate = new Date(now);
    unlockDate.setDate(unlockDate.getDate() + 1);
    unlockDate.setHours(hours || 4, minutes || 0, 0, 0);

    const newJournal: JournalEntry = {
      id: journalId,
      createdAt: now.toISOString(),
      unlockAt: unlockDate.toISOString(),
      status: JournalStatus.Sealed,
      content,
      schemaVersion: 1,
      compilerVersion: 1,
      promptVersion: 1,
    };

    await db.journals.put(newJournal);
    set({ todayJournal: newJournal, tasks: [] });
  },

  openJournal: async () => {
    const { todayJournal } = get();
    if (!todayJournal) return;

    // Only transition Ready → Opened
    if (todayJournal.status === JournalStatus.Ready || todayJournal.status === JournalStatus.Sealed || todayJournal.status === JournalStatus.PendingCompilation) {
      const updated = { ...todayJournal, status: JournalStatus.Opened };
      await db.journals.update(todayJournal.id, { status: JournalStatus.Opened });
      set({ todayJournal: updated });
    }
  },

  completeTask: async (taskId: string) => {
    const { tasks } = get();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    if (!task) return;

    const updatedTask = { ...task, completed: true, completedAt: new Date().toISOString() };
    await db.tasks.put(updatedTask);

    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    set({ tasks: newTasks });
  },

  uncompleteTask: async (taskId: string) => {
    const { tasks } = get();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    if (!task) return;

    const updatedTask = { ...task, completed: false };
    delete updatedTask.completedAt;
    await db.tasks.put(updatedTask);

    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    set({ tasks: newTasks });
  },

  addTask: async (journalId: string, title: string, category: TaskCategory = TaskCategory.Other) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      journalId,
      title,
      category,
      estimatedMinutes: 0,
      completed: false,
      sentenceId: 'custom',
    };

    await db.tasks.put(newTask);

    const { todayJournal, tasks } = get();
    if (todayJournal && todayJournal.id === journalId) {
      set({ tasks: [...tasks, newTask] });
    }
  },

  storeSentenceMap: async (journalId: string, map: SentenceMapping[]) => {
    await db.journals.update(journalId, { sentenceMap: map });
    const { todayJournal } = get();
    if (todayJournal && todayJournal.id === journalId) {
      set({ todayJournal: { ...todayJournal, sentenceMap: map } });
    }
  },
}));
