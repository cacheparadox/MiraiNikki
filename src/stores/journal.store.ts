import { create } from 'zustand';
import { type JournalEntry, type Task, JournalStatus, TaskCategory, type SentenceMapping } from '../types';
import { db } from '../db/database';

interface JournalState {
  todayJournal: JournalEntry | null;
  nextJournal: JournalEntry | null;
  tasks: Task[];
  loadTodayJournal: () => Promise<void>;
  sealJournal: (content: string, unlockTime: string) => Promise<void>;
  openJournal: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  uncompleteTask: (taskId: string) => Promise<void>;
  addTask: (journalId: string, title: string, category?: TaskCategory) => Promise<void>;
  storeSentenceMap: (journalId: string, map: SentenceMapping[]) => Promise<void>;
  reorderTask: (taskId: string, newIndex: number) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  todayJournal: null,
  nextJournal: null,
  tasks: [],

  loadTodayJournal: async () => {
    const journals = await db.journals.orderBy('createdAt').reverse().toArray();
    const now = new Date();
    
    // todayJournal is the most recent unarchived journal that has UNLOCKED
    const today = journals.find(j => j.status !== JournalStatus.Archived && new Date(j.unlockAt) <= now);
    
    // nextJournal is the most recent journal that is STILL LOCKED
    const next = journals.find(j => j.status !== JournalStatus.Archived && new Date(j.unlockAt) > now);

    if (today) {
      const tasks = await db.tasks.where('journalId').equals(today.id).toArray();
      // sort by order if it exists
      tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      set({ todayJournal: today, nextJournal: next || null, tasks });
    } else {
      set({ todayJournal: null, nextJournal: next || null, tasks: [] });
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
    set({ nextJournal: newJournal });
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
    const { todayJournal, tasks } = get();
    const newTask: Task = {
      id: crypto.randomUUID(),
      journalId,
      title,
      category,
      estimatedMinutes: 0,
      completed: false,
      sentenceId: 'custom',
      order: tasks.length,
    };

    await db.tasks.put(newTask);

    if (todayJournal && todayJournal.id === journalId) {
      set({ tasks: [...tasks, newTask] });
    }
  },

  storeSentenceMap: async (journalId: string, map: SentenceMapping[]) => {
    await db.journals.update(journalId, { sentenceMap: map });
    const { todayJournal, nextJournal } = get();
    if (todayJournal && todayJournal.id === journalId) {
      set({ todayJournal: { ...todayJournal, sentenceMap: map } });
    } else if (nextJournal && nextJournal.id === journalId) {
      set({ nextJournal: { ...nextJournal, sentenceMap: map } });
    }
  },
  
  reorderTask: async (taskId: string, newIndex: number) => {
    const { tasks } = get();
    const oldIndex = tasks.findIndex(t => t.id === taskId);
    if (oldIndex === -1) return;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(oldIndex, 1);
    if (!movedTask) return;
    newTasks.splice(newIndex, 0, movedTask);

    // Update order values
    const updatedTasks = newTasks.map((t, index) => ({ ...t, order: index }));
    
    // Save to DB in bulk
    await Promise.all(updatedTasks.map(t => db.tasks.put(t)));
    
    set({ tasks: updatedTasks });
  }
}));
