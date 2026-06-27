import { create } from 'zustand';
import { type JournalEntry, type Task, JournalStatus, TaskCategory } from '../types';
import { db } from '../db/database';

interface JournalState {
  todayJournal: JournalEntry | null;
  tasks: Task[];
  loadTodayJournal: () => Promise<void>;
  sealJournal: (content: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  addTask: (journalId: string, title: string, category?: TaskCategory) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  todayJournal: null,
  tasks: [],

  loadTodayJournal: async () => {
    // For V1, "today" means the journal created today. 
    // In a real app, date math handles 4 AM unlock thresholds.
    // Simplifying: get the most recent un-archived journal.
    const journals = await db.journals.orderBy('createdAt').reverse().toArray();
    const active = journals.find(j => j.status !== JournalStatus.Archived);
    
    if (active) {
      const tasks = await db.tasks.where('journalId').equals(active.id).toArray();
      set({ todayJournal: active, tasks });
    } else {
      set({ todayJournal: null, tasks: [] });
    }
  },

  sealJournal: async (content: string) => {
    const journalId = crypto.randomUUID();
    const now = new Date();
    
    // Unlock time calculation (e.g. 4 AM tomorrow)
    const unlockDate = new Date(now);
    unlockDate.setDate(unlockDate.getDate() + 1);
    unlockDate.setHours(4, 0, 0, 0);

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

  completeTask: async (taskId: string) => {
    const { tasks } = get();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const updatedTask = { ...tasks[taskIndex], completed: true, completedAt: new Date().toISOString() };
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
  }
}));
