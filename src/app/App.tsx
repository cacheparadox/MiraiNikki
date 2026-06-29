import React, { useEffect, useState, useRef } from 'react';
import { useUIStore } from '../stores/ui.store';
import { useSettingsStore } from '../stores/settings.store';
import { useJournalStore } from '../stores/journal.store';
import { useTheme } from '../hooks/useTheme';
import { TomorrowScreen } from '../features/tomorrow/TomorrowScreen';
import { WriteScreen } from '../features/write/WriteScreen';
import { ArchiveScreen } from '../features/archive/ArchiveScreen';
import { ArchiveDetailScreen } from '../features/archive/ArchiveDetailScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { BottomNav } from '../components/BottomNav';
import { CompilerEngine } from '../compiler/CompilerEngine';
import clsx from 'clsx';

export const App: React.FC = () => {
  const { currentScreen, setScreen, toastMessage } = useUIStore();
  const { settings, loadSettings } = useSettingsStore();
  const { loadTodayJournal, todayJournal } = useJournalStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Apply theme class to document based on settings
  useTheme();

  useEffect(() => {
    CompilerEngine.start();
    return () => CompilerEngine.stop();
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadSettings();
      await loadTodayJournal();
      setIsInitializing(false);
    };
    init();
  }, []);

  const hasRoutedInitially = useRef(false);

  // Intelligent Routing on startup
  useEffect(() => {
    if (isInitializing || !settings) return;
    if (!settings.onboardingCompleted) return;
    
    // Only route automatically on the very first evaluation
    if (hasRoutedInitially.current) return;
    hasRoutedInitially.current = true;

    // Determine initial route based on PRD §5 logic
    const hasActiveJournal = !!todayJournal;
    
    // Check if there's a journal that hasn't reached its unlock time yet
    // Or if there is NO journal, we should route to write.
    // If it HAS unlocked, we should route to Tomorrow (Tasks).
    if (!hasActiveJournal) {
      if (currentScreen !== 'write' && currentScreen !== 'settings' && currentScreen !== 'archive') {
        setScreen('write');
      }
    } else {
      if (currentScreen !== 'tomorrow' && currentScreen !== 'settings' && currentScreen !== 'archive') {
        setScreen('tomorrow');
      }
    }
  }, [isInitializing, settings, todayJournal, currentScreen, setScreen]);

  if (isInitializing || !settings) {
    return <div className="h-screen w-full bg-[var(--color-bg)]" />;
  }

  if (!settings.onboardingCompleted) {
    return <OnboardingScreen />;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[900px] mx-auto bg-[var(--color-bg)] text-[var(--color-text-primary)] safe-area-bottom">
      
      {/* Toast Notification */}
      <div 
        className={clsx(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none",
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        <div className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-divider)] px-4 py-2 rounded-full shadow-lg font-medium text-sm">
          {toastMessage}
        </div>
      </div>

      <main className="flex-1 overflow-hidden relative">
        {currentScreen === 'tomorrow' && <div className="absolute inset-0 overflow-y-auto"><TomorrowScreen /></div>}
        {currentScreen === 'write' && <div className="absolute inset-0 overflow-y-auto"><WriteScreen /></div>}
        {currentScreen === 'archive' && <div className="absolute inset-0 overflow-hidden"><ArchiveScreen /></div>}
        {currentScreen === 'archive-detail' && <div className="absolute inset-0 overflow-hidden"><ArchiveDetailScreen /></div>}
        {currentScreen === 'settings' && <div className="absolute inset-0 overflow-hidden"><SettingsScreen /></div>}
      </main>
      
      <BottomNav />
    </div>
  );
};
