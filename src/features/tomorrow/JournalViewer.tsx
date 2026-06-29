import React from 'react';
import type { SentenceMapping } from '../../types';
import clsx from 'clsx';

interface JournalViewerProps {
  content: string;
  sentenceMap?: SentenceMapping[] | undefined;
  highlightedSentenceId: string | null;
  selectedSentenceId?: string | null;
  onSentenceClick?: (id: string) => void;
}

export const JournalViewer: React.FC<JournalViewerProps> = ({ content, sentenceMap, highlightedSentenceId, selectedSentenceId, onSentenceClick }) => {
  // If we have a sentence map, we can highlight individual sentences
  // If not (legacy entries), we just render the raw text

  if (!sentenceMap || sentenceMap.length === 0) {
    return (
      <div className="bg-[var(--color-paper)] p-6 rounded-xl shadow-inner border border-[var(--color-divider)]">
        <p className="font-journal text-xl leading-relaxed text-[#1C1C1C] whitespace-pre-wrap">
          {content}
        </p>
      </div>
    );
  }

  // Render using sentence map. We need to be careful to preserve paragraphs.
  // The segmenter splits by sentences, but newlines might be inside sentences or lost.
  // A robust way is to replace the sentence text within the original content with highlighted spans.
  // However, since we stored the exact text, we can render the text and just check if it matches.
  // Actually, standard segmenter keeps whitespaces.
  
  return (
    <div className="bg-[var(--color-paper)] p-6 rounded-xl shadow-inner border border-[var(--color-divider)]">
      <p className="font-journal text-xl leading-relaxed text-[#1C1C1C] whitespace-pre-wrap">
        {sentenceMap.map((sentence) => (
          <span
            key={sentence.id}
            onClick={() => onSentenceClick && onSentenceClick(sentence.id)}
            className={clsx(
              'transition-all duration-300 rounded px-0.5',
              (highlightedSentenceId === sentence.id || selectedSentenceId === sentence.id) 
                ? 'bg-[var(--color-gold)]/40 shadow-[0_0_8px_rgba(214,177,94,0.4)]'
                : 'bg-transparent',
              onSentenceClick && 'cursor-pointer hover:bg-[var(--color-gold)]/20'
            )}
          >
            {sentence.text + ' '}
          </span>
        ))}
      </p>
    </div>
  );
};
