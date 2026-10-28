import { documentHeadings, documentHeadingId, type DocNode } from './document';

export const articleHeadingId = documentHeadingId;

export interface ArticleHeading { id: string; title: string; level: number }

export function articleHeadings(document: DocNode | null): ArticleHeading[] {
  return documentHeadings(document).map(heading => ({ id: heading.id, title: heading.heading, level: heading.level }));
}

// Count whitespace-separated words in blocks, keeping adjacent text/mark runs
// together. This is an estimate at 200 words/minute, not a stored DB column.
export function articleReadingTime(document: DocNode | null) {
  if (!document) return null;
  function text(node: DocNode): string {
    if (node.type === 'text') return node.text || '';
    if (node.type === 'hardBreak') return ' ';
    const separator = ['paragraph', 'heading', 'codeBlock'].includes(node.type) ? '' : ' ';
    return (node.content || []).map(text).join(separator);
  }
  const words = text(document).trim().split(/\s+/u).filter(Boolean).length;
  return words ? { words, minutes: Math.max(1, Math.ceil(words / 200)) } : null;
}
