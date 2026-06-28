import React, { useEffect, useState } from 'react';
import { useArchiveStore } from '../../stores/archive.store';
import { useUIStore } from '../../stores/ui.store';
import { ArrowLeft, Check, Tag, Clock } from 'lucide-react';
import { JournalViewer } from '../tomorrow/JournalViewer';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import clsx from 'clsx';

export const ArchiveDetailScreen: React.FC = () => {
  const { selectedArchiveId, setScreen } = useUIStore();
  const { selectedJournal, selectedTasks, loadArchiveDetail, deleteJournal } = useArchiveStore();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (selectedArchiveId) {
      loadArchiveDetail(selectedArchiveId);
    } else {
      setScreen('archive');
    }
  }, [selectedArchiveId]);

  if (!selectedJournal) return null;

  const dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(selectedJournal.createdAt));
  
  const handleDelete = async () => {
    await deleteJournal(selectedJournal.id);
    setIsDeleteModalOpen(false);
    setScreen('archive');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] animate-slide-up relative z-20">
      <header className="sticky top-0 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-divider)] p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setScreen('archive')}
            className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-journal">{dateStr}</h1>
        </div>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-xs font-bold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          Delete
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <JournalViewer 
          content={selectedJournal.content} 
          sentenceMap={selectedJournal.sentenceMap}
          highlightedSentenceId={highlightedId}
        />

        <div className="mt-8 mb-12">
          <h3 className="text-lg font-bold mb-4 px-2">Execution Record</h3>
          
          {selectedTasks.length === 0 ? (
            <p className="text-[var(--color-muted)] px-2">No tasks extracted for this day.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedTasks.map(task => (
                <div 
                  key={task.id}
                  className={clsx(
                    "flex items-start gap-4 p-4 rounded-xl border transition-all duration-300",
                    task.completed 
                      ? "bg-[var(--color-surface)] border-transparent opacity-80" 
                      : "bg-[var(--color-surface)] border-[var(--color-danger)]/30 opacity-70"
                  )}
                  onMouseEnter={() => setHighlightedId(task.id)}
                  onMouseLeave={() => setHighlightedId(null)}
                >
                  <div className={clsx(
                    "flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    task.completed
                      ? "bg-[var(--color-success)] border-[var(--color-success)] text-[var(--color-bg)]"
                      : "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/50 text-[var(--color-danger)]"
                  )}>
                    {task.completed ? <Check size={14} strokeWidth={3} /> : <span className="text-[10px] font-bold">✕</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={clsx(
                      "text-base font-medium mb-1.5",
                      task.completed ? "line-through text-[var(--color-muted)]" : "text-[var(--color-danger)]/80"
                    )}>
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-muted)]">
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {task.category}
                      </span>
                      {task.estimatedMinutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Archive Entry?"
        body="This will permanently delete this journal entry and its associated tasks. This cannot be undone."
        confirmText="Delete Entry"
        cancelText="Keep Entry"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDestructive={true}
      />
    </div>
  );
};
