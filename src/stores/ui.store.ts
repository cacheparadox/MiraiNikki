import { create } from 'zustand';

export type AppScreen = 'tomorrow' | 'write' | 'archive' | 'settings';

interface UIState {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  // We can add toasts or modals here later
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'tomorrow', // We'll conditionally set this on initial load later
  setScreen: (screen) => set({ currentScreen: screen }),
}));
