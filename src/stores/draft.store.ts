import { create } from 'zustand';
import type { Draft } from '../types';
import { db } from '../db/database';

interface DraftState {
  draftContent: string;
  loadDraft: () => Promise<void>;
  saveDraft: (content: string) => Promise<void>;
  clearDraft: () => Promise<void>;
}

export const useDraftStore = create<DraftState>((set) => ({
  draftContent: '',
  loadDraft: async () => {
    const draft = await db.drafts.get('singleton');
    if (draft) {
      set({ draftContent: draft.currentContent });
    }
  },
  saveDraft: async (content: string) => {
    const draft: Draft = {
      id: 'singleton',
      currentContent: content,
      updatedAt: new Date().toISOString(),
    };
    await db.drafts.put(draft);
    set({ draftContent: content });
  },
  clearDraft: async () => {
    await db.drafts.delete('singleton');
    set({ draftContent: '' });
  },
}));
