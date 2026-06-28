import React, { useState, useEffect } from 'react';
import { JournalEditor } from './JournalEditor';
import { sealJournal } from './sealJournal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useDraftStore } from '../../stores/draft.store';
import { useJournalStore } from '../../stores/journal.store';
import clsx from 'clsx';

export const WriteScreen: React.FC = () => {
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isAnimatingSeal, setIsAnimatingSeal] = useState(false);
  
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
    if (draftContent && !isRecoveryModalOpen && !sessionStorage.getItem('recoveryShown')) {
      // Don't show recovery if they just opened the app and the draft is the initial template
      if (draftContent !== 'From your future self,\n\nToday, ') {
        setIsRecoveryModalOpen(true);
      }
      sessionStorage.setItem('recoveryShown', 'true');
    }
  }, [draftContent]);

  const handleSealConfirm = async () => {
    setIsSealModalOpen(false);
    setIsAnimatingSeal(true);
    
    // Wait for morph animation + a little bit of seal stamp time before transitioning
    setTimeout(async () => {
      await sealJournal();
    }, 1200);
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

  const isEditorEmpty = !draftContent.trim() || draftContent === 'From your future self,\n\nToday, ';

  return (
    <div className="flex flex-col h-full p-4 gap-4 max-w-2xl mx-auto w-full animate-fade-in relative">
      {/* Morphing overlay for animation */}
      {isAnimatingSeal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D6B15E] to-[#B8942E] shadow-2xl animate-seal-stamp flex items-center justify-center">
             <span className="font-journal text-4xl font-bold text-[#1A1D2E]">未</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full animate-seal-glow" />
          </div>
        </div>
      )}

      <header className={clsx("flex justify-between items-end mb-2 px-2 transition-opacity duration-500", isAnimatingSeal && "opacity-0")}>
        <div>
          <p className="text-sm text-[var(--color-muted)] uppercase tracking-wider font-semibold">Write Tomorrow</p>
          <h1 className="text-2xl font-bold text-[var(--color-gold)]">{today}</h1>
        </div>
      </header>

      <div className={clsx("flex-1 min-h-0 transition-all duration-700", isAnimatingSeal && "opacity-0 scale-95")}>
        <JournalEditor />
      </div>

      <button
        onClick={() => setIsSealModalOpen(true)}
        disabled={isEditorEmpty || isAnimatingSeal}
        className={clsx(
          "w-full py-4 font-bold text-lg bg-[var(--color-gold)] text-[var(--color-bg)] transition-all shadow-lg",
          isAnimatingSeal ? "opacity-0 scale-0 pointer-events-none" : "rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        Seal Tomorrow
      </button>

      <ConfirmationModal
        isOpen={isSealModalOpen}
        title="Seal Tomorrow?"
        body="Once sealed, tomorrow cannot be edited until it arrives."
        confirmText="Seal Tomorrow"
        cancelText="Cancel"
        onConfirm={handleSealConfirm}
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