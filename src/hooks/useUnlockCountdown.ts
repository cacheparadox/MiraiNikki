import { useState, useEffect, useCallback } from 'react';

/**
 * Returns the time remaining until `unlockAt`, updating every second.
 * Returns null if already unlocked.
 */
export function useUnlockCountdown(unlockAt: string | undefined) {
  const [remaining, setRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  const calculate = useCallback(() => {
    if (!unlockAt) return null;
    const diff = new Date(unlockAt).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      total: diff,
    };
  }, [unlockAt]);

  useEffect(() => {
    setRemaining(calculate());
    const interval = setInterval(() => {
      const r = calculate();
      setRemaining(r);
      if (!r) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calculate]);

  return remaining;
}
