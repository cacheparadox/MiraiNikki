import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settings.store';

export function useTheme() {
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    const root = document.documentElement;

    if (!settings) return;

    root.classList.remove('theme-light', 'theme-dark');

    if (settings.theme === 'Light') {
      root.classList.add('theme-light');
    } else if (settings.theme === 'Dark') {
      root.classList.add('theme-dark');
    }
    // 'System' leaves no class — CSS handles via prefers-color-scheme
  }, [settings?.theme]);
}
