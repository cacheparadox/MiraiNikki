import { create } from 'zustand';
import type { AppSettings } from '../types';
import { db } from '../db/database';

interface SettingsState {
  settings: AppSettings | null;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  purgeAllData: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  id: 'singleton',
  theme: 'System',
  unlockTime: '04:00',
  enableNotifications: false,
  aiProvider: 'OpenRouter',
  aiModel: 'google/gemini-2.5-flash-preview-05-20',
  onboardingCompleted: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,

  loadSettings: async () => {
    let s = await db.settings.get('singleton');
    if (!s) {
      await db.settings.put(defaultSettings);
      s = defaultSettings;
    }
    set({ settings: s });
  },

  updateSettings: async (newSettings) => {
    const { settings } = get();
    if (!settings) return;
    const updated = { ...settings, ...newSettings };
    await db.settings.put(updated);
    set({ settings: updated });
  },

  purgeAllData: async () => {
    await db.journals.clear();
    await db.tasks.clear();
    await db.drafts.clear();
    await db.queue.clear();
    await db.logs.clear();
    // Keep settings intact
  },
}));
