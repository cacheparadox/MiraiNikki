import React, { useEffect, useState } from 'react';
import { useJournalStore } from '../../stores/journal.store';
import { useCompilerStore } from '../../stores/compiler.store';
import { useUIStore } from '../../stores/ui.store';
import { JournalViewer } from './JournalViewer';
import { TaskList } from './TaskList';
import { DiaryCard } from '../../components/DiaryCard';
import { JournalStatus } from '../../types';
import { useUnlockCountdown } from '../../hooks/useUnlockCountdown';
import { Loader2, X } from 'lucide-react';

export const TomorrowScreen: React.FC = () => {
  const { todayJournal, tasks, loadTodayJournal, completeTask, uncompleteTask, addTask, openJournal, reorderTask, editTask, clearCompilerError } = useJournalStore();
  const { queueItems, loadQueue, cancelCompilation, recompileJournal } = useCompilerStore();
  const { setScreen } = useUIStore();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);

  useEffect(() => {
    loadTodayJournal();
    loadQueue();
  }, []);

  const countdown = useUnlockCountdown(todayJournal?.unlockAt);

  if (!todayJournal) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">Tomorrow is unwritten.</h2>
        <p className="text-[var(--color-muted)] mb-8">Take a moment to narrate what you will accomplish tomorrow.</p>
        <button 
          onClick={() => setScreen('write')}
          className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Write Tomorrow
        </button>
      </div>
    );
  }

  const isLocked = countdown !== null && new Date().getTime() < new Date(todayJournal.unlockAt).getTime();

  // If locked, show the countdown
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-8 text-[var(--color-muted)]">Your future hasn't arrived yet.</h2>
        
        <DiaryCard status={JournalStatus.Sealed} className="mb-12" />

        <div className="flex flex-col items-center">
          <p className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Next Unlock</p>
          <div className="text-4xl font-journal font-bold text-[var(--color-gold)] animate-pulse-soft">
            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
    );
  }

  // If not locked, but not opened yet, show the "Open Tomorrow" gate
  if (todayJournal.status !== JournalStatus.Opened && todayJournal.status !== JournalStatus.Archived) {
    const handleOpen = async () => {
      setIsAnimatingOpen(true);
      setTimeout(async () => {
        await openJournal();
        setIsAnimatingOpen(false);
      }, 600); // match animation duration
    };

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        <h2 className="text-3xl font-journal font-bold mb-2 text-[#F8F9FA]">Good Morning.</h2>
        <p className="text-[var(--color-muted)] mb-12">Your future has arrived.</p>
        
        <DiaryCard 
          status={todayJournal.status} 
          isAnimating={isAnimatingOpen}
          className="mb-8"
        />

        <button 
          onClick={handleOpen}
          disabled={isAnimatingOpen}
          className="px-8 py-4 bg-[var(--color-gold)] text-[var(--color-bg)] rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg animate-slide-up disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Open Tomorrow
        </button>
      </div>
    );
  }

  // Fully opened view
  const currentQueueItem = queueItems.find(q => q.journalId === todayJournal.id);
  const isCompiling = !!currentQueueItem && currentQueueItem.status !== 'Failed' && currentQueueItem.status !== 'Removed';
  const isError = todayJournal.compilerStatus?.startsWith('Error') || currentQueueItem?.status === 'Failed';
  
  const filteredTasks = selectedSentenceId 
    ? tasks.filter(t => t.sentenceId === selectedSentenceId || t.sentenceId === 'custom')
    : tasks;

  return (
    <div className="flex flex-col h-full p-4 gap-6 max-w-2xl mx-auto w-full animate-fade-in">
      <header className="px-2 mt-4">
        <p className="text-sm text-[var(--color-muted)] uppercase tracking-wider font-semibold">Today's Journey</p>
        <h1 className="text-2xl font-bold text-[var(--color-gold)]">
          {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
        </h1>
      </header>

      <JournalViewer 
        content={todayJournal.content}
        sentenceMap={todayJournal.sentenceMap}
        highlightedSentenceId={highlightedId}
        selectedSentenceId={selectedSentenceId}
        onSentenceClick={(id) => setSelectedSentenceId(prev => prev === id ? null : id)}
      />

      <div className="mt-4">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-xl font-bold">Execution Plan</h3>
          {!isCompiling && (
            <button 
              onClick={() => recompileJournal(todayJournal.id)}
              className="text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
            >
              Recompile
            </button>
          )}
        </div>
        
        {isCompiling && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-xl">
            <Loader2 className="animate-spin mb-4 text-[var(--color-gold)]" size={32} />
            <p>
              {currentQueueItem?.status === 'WaitingRetry' ? `Retrying soon... (Attempt ${currentQueueItem.attempts})` : 'Compiling your future...'}
            </p>
            <button 
              onClick={() => cancelCompilation(todayJournal.id)}
              className="mt-6 px-4 py-2 text-sm border border-[var(--color-danger)] text-[var(--color-danger)] rounded-lg hover:bg-[var(--color-danger)]/10 transition-colors"
            >
              Cancel Compilation
            </button>
          </div>
        )}
        
        {isError && !isCompiling && (
          <div className="p-4 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl border border-[var(--color-danger)]/20 mb-4 relative">
            <button 
              onClick={() => clearCompilerError(todayJournal.id)}
              className="absolute top-2 right-2 p-2 hover:bg-[var(--color-danger)]/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
            <h4 className="font-bold mb-1 pr-6">Compilation Failed</h4>
            <p className="text-sm">{todayJournal.compilerStatus || 'Unknown error occurred.'}</p>
            <button 
              onClick={() => recompileJournal(todayJournal.id)}
              className="mt-4 px-4 py-2 text-sm bg-[var(--color-danger)] text-white rounded-lg hover:opacity-90 transition-opacity font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        <TaskList 
          tasks={filteredTasks}
          onComplete={(id) => {
            const task = tasks.find(t => t.id === id);
            if (task?.completed) uncompleteTask(id);
            else completeTask(id);
          }}
          onHoverStart={setHighlightedId}
          onHoverEnd={() => setHighlightedId(null)}
          onAddTask={(title) => addTask(todayJournal.id, title)}
          onReorder={reorderTask}
          onEdit={editTask}
        />
      </div>
    </div>
  );
};