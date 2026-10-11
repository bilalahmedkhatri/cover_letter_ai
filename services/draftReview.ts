/** Local writing checks, not a factual or ATS assessment. */
export function reviewDraft(text: string, language = 'en', maximum = 0) {
  const segmenter = new Intl.Segmenter(language, { granularity: 'word' });
  const words = [...segmenter.segment(text)].filter(segment => segment.isWordLike).length;
  // Only common template forms: ordinary bracketed citations are not flagged.
  const placeholders = [...new Set(text.match(/\[(?:your|insert|company|recipient|name|date|position|role|university|program|имя|название|дата|ваше|ваш)[^\]\n]*\]|\{\{[^}\n]+\}\}|<(?:(?:your|insert)[ _-])[^>\n]+>/giu) || [])];
  return { words, characters: [...text].length, placeholders, overLimit: maximum > 0 && words > maximum };
}
