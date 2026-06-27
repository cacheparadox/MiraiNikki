import React, { useEffect } from 'react';
import { useUIStore } from '../stores/ui.store';
import { TomorrowScreen } from '../features/tomorrow/TomorrowScreen';
import { WriteScreen } from '../features/write/WriteScreen';
import { ArchiveScreen } from '../features/archive/ArchiveScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { BottomNav } from '../components/BottomNav';
import { CompilerEngine } from '../compiler/CompilerEngine';

export const App: React.FC = () => {
  const currentScreen = useUIStore((state) => state.currentScreen);

  useEffect(() => {
    CompilerEngine.start();
    return () => CompilerEngine.stop();
  }, []);

  // Future intelligent routing logic will go here
  // e.g. If no journal today, switch to 'write' automatically on initial load.

  return (
    <div className="flex flex-col h-screen w-full max-w-[900px] mx-auto bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <main className="flex-1 overflow-y-auto pb-20">
        {currentScreen === 'tomorrow' && <TomorrowScreen />}
        {currentScreen === 'write' && <WriteScreen />}
        {currentScreen === 'archive' && <ArchiveScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </main>
      
      <BottomNav />
    </div>
  );
};
