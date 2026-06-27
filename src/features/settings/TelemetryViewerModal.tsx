import React, { useEffect, useState } from 'react';
import type { TelemetryLog } from '../../types';
import { db } from '../../db/database';
import { X, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface TelemetryViewerModalProps {
  onClose: () => void;
}

export const TelemetryViewerModal: React.FC<TelemetryViewerModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);

  const loadLogs = async () => {
    const data = await db.logs.orderBy('timestamp').reverse().limit(100).toArray();
    setLogs(data);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const clearLogs = async () => {
    await db.logs.clear();
    await loadLogs();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-xl flex flex-col border border-[var(--color-divider)]">
        <div className="p-4 border-b border-[var(--color-divider)] flex items-center justify-between">
          <h2 className="text-xl font-bold">Compiler Telemetry</h2>
          <div className="flex items-center gap-2">
            <button onClick={clearLogs} className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-full transition-colors" title="Clear Logs">
              <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-[var(--color-divider)] rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {logs.length === 0 ? (
            <div className="text-center text-[var(--color-muted)] py-8">No telemetry logs found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="text-xs bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-divider)] font-mono">
                <div className="flex items-center gap-2 mb-1">
                  <span className="opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={clsx(
                    "font-bold px-1.5 py-0.5 rounded",
                    log.level === 'error' ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' : 
                    log.level === 'warn' ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)]' : 
                    'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  )}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="font-bold">{log.component}</span>
                </div>
                <div className="whitespace-pre-wrap font-sans text-sm">{log.message}</div>
                {log.details && (
                  <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto text-[10px] opacity-80">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
