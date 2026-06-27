import React, { useState, useEffect } from 'react';
import { JournalEditor } from './JournalEditor';
import { sealJournal } from './sealJournal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useDraftStore } from '../../stores/draft.store';
import { useJournalStore } from '../../stores/journal.store';

export const WriteScreen: React.FC = () => {
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  
  const { draftContent, loadDraft, clearDraft } = useDraftStore();
  const { loadTodayJournal, todayJournal } = useJournalStore();

  useEffect(() => {
    const init = async () => {
      await loadTodayJournal();
      await loadDraft();
    };
    init();
  }, []);

  useEffect(() => {
    // Show recovery modal if a draft exists on initial load
    if (draftContent && !isRecoveryModalOpen && !sessionStorage.getItem('recoveryShown')) {
      setIsRecoveryModalOpen(true);
      sessionStorage.setItem('recoveryShown', 'true');
    }
  }, [draftContent]);

  const handleSeal = async () => {
    await sealJournal();
    setIsSealModalOpen(false);
  };

  const handleDiscardDraft = async () => {
    await clearDraft();
    setIsRecoveryModalOpen(false);
  };

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  if (todayJournal) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">Tomorrow is already written.</h2>
        <p className="text-[var(--color-muted)]">Wait until tomorrow morning to open your diary.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4 max-w-2xl mx-auto w-full animate-fade-in">
      <header className="flex justify-between items-end mb-2 px-2">
        <div>
          <p className="text-sm text-[var(--color-muted)] uppercase tracking-wider font-semibold">Write Tomorrow</p>
          <h1 className="text-2xl font-bold text-[var(--color-gold)]">{today}</h1>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <JournalEditor />
      </div>

      <button
        onClick={() => setIsSealModalOpen(true)}
        disabled={!draftContent.trim()}
        className="w-full py-4 rounded-xl font-bold text-lg bg-[var(--color-gold)] text-[var(--color-bg)] transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
      >
        Seal Tomorrow
      </button>

      <ConfirmationModal
        isOpen={isSealModalOpen}
        title="Seal Tomorrow?"
        body="Once sealed, tomorrow cannot be edited until it arrives."
        confirmText="Seal Tomorrow"
        cancelText="Cancel"
        onConfirm={handleSeal}
        onCancel={() => setIsSealModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isRecoveryModalOpen}
        title="Unfinished Tomorrow Found"
        body="We found an unfinished draft from a previous session. Would you like to continue writing or discard it?"
        confirmText="Continue Writing"
        cancelText="Discard Draft"
        onConfirm={() => setIsRecoveryModalOpen(false)}
        onCancel={handleDiscardDraft}
        isDestructive={true}
      />
    </div>
  );
};