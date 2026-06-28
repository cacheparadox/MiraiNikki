import { create } from 'zustand';

export type AppScreen = 'tomorrow' | 'write' | 'archive' | 'archive-detail' | 'settings';

interface UIState {
  currentScreen: AppScreen;
  selectedArchiveId: string | null;
  isOnboardingVisible: boolean;
  toastMessage: string | null;
  setScreen: (screen: AppScreen) => void;
  openArchiveDetail: (journalId: string) => void;
  setOnboardingVisible: (visible: boolean) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'tomorrow',
  selectedArchiveId: null,
  isOnboardingVisible: false,
  toastMessage: null,

  setScreen: (screen) => set({ currentScreen: screen, selectedArchiveId: null }),

  openArchiveDetail: (journalId) => set({
    currentScreen: 'archive-detail',
    selectedArchiveId: journalId,
  }),

  setOnboardingVisible: (visible) => set({ isOnboardingVisible: visible }),

  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  clearToast: () => set({ toastMessage: null }),
}));
