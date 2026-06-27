import React, { useEffect, useState } from 'react';
import { useJournalStore } from '../../stores/journal.store';
import { useCompilerStore } from '../../stores/compiler.store';
import { useUIStore } from '../../stores/ui.store';
import { JournalViewer } from './JournalViewer';
import { TaskList } from './TaskList';
import { Loader2 } from 'lucide-react';

export const TomorrowScreen: React.FC = () => {
  const { todayJournal, tasks, loadTodayJournal, completeTask, addTask } = useJournalStore();
  const { queueItems, loadQueue, cancelCompilation, recompileJournal } = useCompilerStore();
  const { setScreen } = useUIStore();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    loadTodayJournal();
    loadQueue();
  }, []);

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

  const currentQueueItem = queueItems.find(q => q.journalId === todayJournal.id);
  const isCompiling = !!currentQueueItem && currentQueueItem.status !== 'Failed' && currentQueueItem.status !== 'Removed';
  const isError = todayJournal.compilerStatus?.startsWith('Error') || currentQueueItem?.status === 'Failed';

  const isTomorrow = new Date().getTime() < new Date(todayJournal.unlockAt).getTime();
  const titleText = isTomorrow ? "Tomorrow's Tasks" : "Today's Tasks";
  
  return (
    <div className="flex flex-col h-full p-4 gap-6 max-w-2xl mx-auto w-full animate-fade-in">
      <header className="px-2 mt-4">
        <p className="text-sm text-[var(--color-muted)] uppercase tracking-wider font-semibold">{titleText}</p>
        <h1 className="text-2xl font-bold text-[var(--color-gold)]">
          {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(isTomorrow ? todayJournal.unlockAt : todayJournal.createdAt))}
        </h1>
      </header>

      <JournalViewer 
        content={todayJournal.content} 
        highlightedSentenceId={highlightedId}
      />

      <div className="mt-4">
        <h3 className="text-xl font-bold mb-4 px-2">Execution Plan</h3>
        
        {isCompiling && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-muted)]">
            <Loader2 className="animate-spin mb-4" size={32} />
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
          <div className="p-4 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl border border-[var(--color-danger)]/20 mb-4">
            <h4 className="font-bold mb-1">Compilation Failed</h4>
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
          tasks={tasks}
          onComplete={completeTask}
          onHoverStart={setHighlightedId}
          onHoverEnd={() => setHighlightedId(null)}
          onAddTask={(title) => addTask(todayJournal.id, title)}
        />
      </div>
    </div>
  );
};