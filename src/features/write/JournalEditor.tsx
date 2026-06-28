import React, { useEffect, useState, useRef } from 'react';
import { useDraftStore } from '../../stores/draft.store';

const INITIAL_TEMPLATE = 'From your future self,\n\nToday, ';

export const JournalEditor: React.FC = () => {
  const { draftContent, saveDraft } = useDraftStore();
  const [localContent, setLocalContent] = useState(draftContent || INITIAL_TEMPLATE);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Update local content if draftContent is loaded asynchronously on mount
  useEffect(() => {
    if (draftContent !== localContent && draftContent) {
      setLocalContent(draftContent);
    } else if (!draftContent && localContent !== INITIAL_TEMPLATE) {
      // If draft was cleared, reset to template
      setLocalContent(INITIAL_TEMPLATE);
    }
  }, [draftContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveDraft(newContent);
    }, 500);
  };

  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full bg-[var(--color-paper)] rounded-xl shadow-inner border border-[var(--color-divider)] p-6 relative">
      <textarea
        className="flex-1 w-full h-full bg-transparent resize-none outline-none text-[#1C1C1C] font-journal text-2xl leading-relaxed placeholder:text-[var(--color-muted)] placeholder:opacity-50"
        placeholder="Write tomorrow as if it has already happened..."
        value={localContent}
        onChange={handleChange}
        spellCheck={false}
      />
      <div className="absolute bottom-4 right-6 text-sm font-medium text-[var(--color-muted)] mix-blend-difference opacity-50">
        {wordCount} words
      </div>
    </div>
  );
};
