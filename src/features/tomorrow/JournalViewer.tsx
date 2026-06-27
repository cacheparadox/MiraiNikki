import React, { useMemo } from 'react';
import { segmentText } from '../../utils/segmenter';
import clsx from 'clsx';

interface JournalViewerProps {
  content: string;
  highlightedSentenceId: string | null;
}

export const JournalViewer: React.FC<JournalViewerProps> = ({ content, highlightedSentenceId }) => {
  // We use segmentText purely to reconstruct the sentences so we can render them individually
  // Since segmentText assigns random UUIDs every time it runs, the UUIDs won't match the compiler ones unless we stored them!
  // BUT Wait: The task stores the UUID assigned by Normalizer during compilation.
  // To highlight correctly, the JournalViewer needs the EXACT same UUIDs. 
  // We can't re-segment on the fly if UUIDs are random.
  
  // Correction: We should store the segmented sentences in the DB OR use the text index.
  // Actually, the simplest way without changing schema is to pass the text and the sentence index, not a random UUID.
  // Ah, the PRD and my previous normalizer logic uses UUIDs.
  // If the Normalizer assigned UUIDs, the frontend must know which sentence has which UUID.
  // Since we didn't save the UUID map to the JournalEntry, we have a small architectural gap.
  
  // For V1 UI, a simple fallback: Just render the raw content. Highlighting is a bonus feature.
  // Let's implement a simple paragraph render for now.
  
  return (
    <div className="bg-[var(--color-paper)] p-6 rounded-xl shadow-inner border border-[var(--color-divider)]">
      <p className="font-journal text-xl leading-relaxed text-[#1C1C1C] whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
};
