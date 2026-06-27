export interface SegmentedSentence {
  id: string; // UUID
  index: number;
  text: string;
}

/**
 * Splits text into sentences using the browser's native Intl.Segmenter.
 * Assigns a stable UUID to each sentence.
 */
export function segmentText(text: string): SegmentedSentence[] {
  // Polyfill fallback if Intl.Segmenter is not supported in some older browsers
  // But since we target modern browsers for PWA, this is generally safe.
  if (!Intl || !Intl.Segmenter) {
    console.warn("Intl.Segmenter not supported. Falling back to regex splitting.");
    return text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0).map((s, idx) => ({
      id: crypto.randomUUID(),
      index: idx,
      text: s.trim()
    }));
  }

  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  const segments = segmenter.segment(text);
  
  const results: SegmentedSentence[] = [];
  let index = 0;
  
  for (const segment of segments) {
    const trimmed = segment.segment.trim();
    if (trimmed.length > 0) {
      results.push({
        id: crypto.randomUUID(),
        index: index++,
        text: trimmed
      });
    }
  }

  return results;
}
