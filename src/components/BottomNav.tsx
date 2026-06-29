import React from 'react';
import { useUIStore, type AppScreen } from '../stores/ui.store';
import { PenTool, Archive, Settings, CheckSquare } from 'lucide-react';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  const { currentScreen, setScreen } = useUIStore();

  const navItems: { id: AppScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'write', label: 'Write', icon: <PenTool size={20} /> },
    { id: 'tomorrow', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'archive', label: 'Archive', icon: <Archive size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="shrink-0 w-full h-16 bg-[var(--color-surface)] border-t border-[var(--color-divider)] flex justify-around items-center px-2 z-50">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={clsx(
              'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
              isActive ? 'text-[var(--color-gold)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text-primary)]'
            )}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
