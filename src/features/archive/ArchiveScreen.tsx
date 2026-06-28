import React, { useEffect } from 'react';
import { useArchiveStore } from '../../stores/archive.store';
import { useUIStore } from '../../stores/ui.store';
import { Archive, CheckCircle, CircleDashed } from 'lucide-react';
import clsx from 'clsx';

export const ArchiveScreen: React.FC = () => {
  const { monthGroups, loadArchive } = useArchiveStore();
  const { openArchiveDetail } = useUIStore();

  useEffect(() => {
    loadArchive();
  }, []);

  return (
    <div className="flex flex-col h-full p-4 max-w-2xl mx-auto w-full animate-fade-in overflow-y-auto">
      <header className="px-2 mt-4 mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-gold)] flex items-center gap-2">
          <Archive size={24} />
          Archive
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Past days, sealed and fulfilled.</p>
      </header>

      {monthGroups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--color-muted)] pb-20">
          <Archive size={48} className="mb-4 opacity-20" />
          <p className="text-lg mb-2">No archived days yet.</p>
          <p className="text-sm">Days automatically archive when a new draft is started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pb-20">
          {monthGroups.map(group => (
            <div key={group.month}>
              <h2 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-4 px-2">
                {group.month}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {group.entries.map(journal => {
                  const dateStr = new Intl.DateTimeFormat('en-US', { day: 'numeric', weekday: 'short' }).format(new Date(journal.createdAt));
                  const isFulfilled = journal.taskSummary && journal.taskSummary.total > 0 && journal.taskSummary.completed === journal.taskSummary.total;
                  
                  return (
                    <button 
                      key={journal.id}
                      onClick={() => openArchiveDetail(journal.id)}
                      className={clsx(
                        "flex flex-col items-center justify-between p-4 rounded-xl text-left transition-all duration-300 relative group overflow-hidden",
                        "bg-gradient-to-br from-[#1C1F2E] to-[#14162A] border border-[var(--color-divider)] hover:border-[var(--color-gold)]/50",
                        "aspect-[3/4] shadow-md hover:shadow-lg hover:-translate-y-1"
                      )}
                    >
                      {/* Book spine decoration */}
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-r from-black/40 to-transparent" />
                      
                      <div className="w-full flex justify-between items-start z-10">
                        <span className="font-journal font-bold text-lg text-[var(--color-paper)]">
                          {dateStr}
                        </span>
                        
                        {journal.taskSummary && journal.taskSummary.total > 0 && (
                          <div className={clsx(
                            "flex items-center justify-center w-6 h-6 rounded-full",
                            isFulfilled ? "text-[var(--color-success)] bg-[var(--color-success)]/10" : "text-[var(--color-muted)] bg-[var(--color-muted)]/10"
                          )}>
                            {isFulfilled ? <CheckCircle size={14} /> : <CircleDashed size={14} />}
                          </div>
                        )}
                      </div>
                      
                      <div className="z-10 text-center w-full mt-auto">
                        <h3 className="font-journal text-[var(--color-gold)] font-bold tracking-widest text-sm uppercase opacity-70">
                          Mirai Nikki
                        </h3>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};