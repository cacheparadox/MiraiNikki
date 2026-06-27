import React, { useEffect } from 'react';
import { useArchiveStore } from '../../stores/archive.store';
import { Archive } from 'lucide-react';

export const ArchiveScreen: React.FC = () => {
  const { archivedJournals, loadArchive } = useArchiveStore();

  useEffect(() => {
    loadArchive();
  }, []);

  return (
    <div className="flex flex-col h-full p-4 max-w-2xl mx-auto w-full animate-fade-in">
      <header className="px-2 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-gold)] flex items-center gap-2">
          <Archive size={24} />
          Archive
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Past days, sealed and fulfilled.</p>
      </header>

      {archivedJournals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--color-muted)]">
          <Archive size={48} className="mb-4 opacity-20" />
          <p>Your archive is empty.</p>
          <p className="text-sm mt-2">Past journals will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {archivedJournals.map(journal => (
            <div key={journal.id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-xl cursor-pointer hover:border-[var(--color-gold)] transition-colors">
              <h3 className="font-bold text-lg mb-2">
                {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(journal.createdAt))}
              </h3>
              <p className="text-[var(--color-muted)] text-sm line-clamp-2">
                {journal.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};