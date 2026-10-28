import { safeLink, youtubeUrl } from './urls';

export type DocNode = { type: string; text?: string; attrs?: Record<string, unknown>; content?: DocNode[]; marks?: { type: string; attrs?: Record<string, unknown> }[] };
const containers = new Set(['doc', 'paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock', 'table', 'tableRow', 'tableCell', 'tableHeader']);
const leaves = new Set(['text', 'hardBreak', 'horizontalRule', 'image', 'audio', 'youtube', 'customImage', 'customVideo', 'customAudio', 'customFileAttachment']);
const marks = new Set(['bold', 'italic', 'underline', 'strike', 'code', 'link']);
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

const allowedAttrs: Record<string, string[]> = {
  heading: ['level'], orderedList: ['start', 'type'], codeBlock: ['language'],
  tableCell: ['colspan', 'rowspan', 'colwidth', 'align'], tableHeader: ['colspan', 'rowspan', 'colwidth', 'align'],
  image: ['src', 'alt', 'title', 'width', 'height'],
  audio: ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'controlslist', 'crossorigin', 'disableremoteplayback'],
  youtube: ['src', 'width', 'height', 'start'],
};
const customAttrs = ['asset_id', 'src', 'alt', 'title', 'caption', 'fileName', 'fileSize', 'fileType'];

// All validation completes before traversing, rendering or resolving media.
export function validateDocument(value: unknown, version: number): DocNode | null {
  try {
    if (version !== 1 || !object(value) || value.type !== 'doc' || !Array.isArray(value.content)) return null;
    const stack: { value: unknown; depth: number; parent: string }[] = [{ value, depth: 0, parent: '' }];
    let count = 0, chars = 0;
    while (stack.length) {
      const item = stack.pop()!;
      const node = item.value;
      if (++count > 8000 || item.depth > 24 || !object(node) || typeof node.type !== 'string') return null;
      const kind = node.type;
      if ((!containers.has(kind) && !leaves.has(kind)) || (item.depth > 0 && kind === 'doc')) return null;
      if (Object.keys(node).some(key => !['type', 'text', 'attrs', 'marks', 'content'].includes(key))) return null;
      if (node.attrs !== undefined && !object(node.attrs)) return null;
      const attrs = (node.attrs || {}) as Record<string, unknown>;
      if (Object.keys(attrs).some(key => !(kind.startsWith('custom') ? customAttrs : allowedAttrs[kind] || []).includes(key))) return null;
      if (attrs.src != null && !safeLink(attrs.src)?.startsWith('https://')) return null;
      if ((kind === 'youtube' || (kind === 'customVideo' && attrs.asset_id == null)) && !youtubeUrl(attrs.src)) return null;
      if (kind === 'orderedList' && attrs.type != null && !['1', 'a', 'A', 'i', 'I'].includes(String(attrs.type))) return null;
      if (kind === 'codeBlock' && attrs.language != null && (typeof attrs.language !== 'string' || attrs.language.length > 40)) return null;
      if (kind.startsWith('custom') && kind !== 'customVideo' && attrs.asset_id == null) return null;
      if (kind.startsWith('custom')) {
        for (const [name, text] of Object.entries(attrs)) {
          if (!['asset_id', 'src'].includes(name) && (typeof text !== 'string' || text.length > 1000)) return null;
        }
      }
      if (['image', 'audio', 'youtube'].includes(kind)) {
        if (typeof attrs.src !== 'string' || attrs.src.length > 2048) return null;
        for (const dimension of [attrs.width, attrs.height]) if (dimension != null && (!Number.isInteger(dimension) || Number(dimension) < 1 || Number(dimension) > 100000)) return null;
        if (kind === 'youtube' && attrs.start != null && (!Number.isInteger(attrs.start) || Number(attrs.start) < 0 || Number(attrs.start) > 86400)) return null;
        for (const text of [attrs.alt, attrs.title]) if (text != null && (typeof text !== 'string' || text.length > 1000)) return null;
        if (kind === 'audio') {
          for (const key of ['controls', 'autoplay', 'loop', 'muted', 'disableremoteplayback']) if (attrs[key] != null && typeof attrs[key] !== 'boolean') return null;
          if (attrs.preload != null && !['none', 'metadata', 'auto'].includes(String(attrs.preload))) return null;
          if (attrs.crossorigin != null && !['', 'anonymous', 'use-credentials'].includes(String(attrs.crossorigin))) return null;
          if (attrs.controlslist != null && (typeof attrs.controlslist !== 'string' || attrs.controlslist.length > 100)) return null;
        }
      }
      if (kind === 'text') { if (typeof node.text !== 'string' || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(node.text)) return null; chars += node.text.length; }
      else if (node.text !== undefined) return null;
      if (chars > 200000) return null;
      if (kind === 'heading' && (!Number.isInteger(attrs.level) || Number(attrs.level) < 1 || Number(attrs.level) > 6)) return null;
      if (kind === 'orderedList' && attrs.start !== undefined && (!Number.isInteger(attrs.start) || Number(attrs.start) < 1 || Number(attrs.start) > 100000)) return null;
      if (kind.startsWith('custom') && attrs.asset_id !== undefined && attrs.asset_id !== null && (!Number.isInteger(attrs.asset_id) || Number(attrs.asset_id) < 1 || Number(attrs.asset_id) > 2147483647)) return null;
      if (node.marks !== undefined && (!Array.isArray(node.marks) || node.marks.length > 8 || (node.marks.length > 0 && kind !== 'text'))) return null;
      for (const mark of (node.marks || []) as unknown[]) {
        if (!object(mark) || typeof mark.type !== 'string' || !marks.has(mark.type) || (mark.attrs !== undefined && !object(mark.attrs))) return null;
        if (Object.keys(mark).some(key => !['type', 'attrs'].includes(key))) return null;
        const markAttrs = (mark.attrs || {}) as Record<string, unknown>;
        if (mark.type === 'link') {
          if (!safeLink(markAttrs.href) || Object.keys(markAttrs).some(key => !['href', 'target', 'rel', 'class'].includes(key))) return null;
        } else if (Object.keys(markAttrs).length) return null;
      }
      if (node.content !== undefined && !Array.isArray(node.content)) return null;
      const children = (node.content || []) as unknown[];
      if (children.length && leaves.has(kind)) return null;
      if (children.length > 8000 || stack.length + children.length > 8000) return null;
      // Match the admin's v1 TableKit contract; never forward arbitrary attrs to HTML.
      if (kind === 'table' || kind === 'tableRow') {
        if (Object.keys(attrs).length) return null;
        if (kind === 'table' && (!children.length || children.some(child => !object(child) || child.type !== 'tableRow'))) return null;
        if (kind === 'tableRow' && (item.parent !== 'table' || children.some(child => !object(child) || !['tableCell', 'tableHeader'].includes(String(child.type))))) return null;
      }
      if (kind === 'tableCell' || kind === 'tableHeader') {
        if (item.parent !== 'tableRow' || Object.keys(attrs).some(key => !['colspan', 'rowspan', 'colwidth', 'align'].includes(key))) return null;
        for (const span of [attrs.colspan ?? 1, attrs.rowspan ?? 1]) {
          if (!Number.isInteger(span) || Number(span) < 1 || Number(span) > 1000) return null;
        }
        if (attrs.colspan === null || attrs.rowspan === null) return null;
        if (attrs.align != null && !['left', 'center', 'right'].includes(String(attrs.align))) return null;
        if (attrs.colwidth != null && (!Array.isArray(attrs.colwidth) || attrs.colwidth.length !== (attrs.colspan ?? 1) || attrs.colwidth.some(width => !Number.isInteger(width) || width < 0 || width > 100000))) return null;
        if (!children.length || children.some(child => !object(child) || ['text', 'hardBreak', 'listItem', 'tableRow', 'tableCell', 'tableHeader'].includes(String(child.type)))) return null;
      }
      if (['paragraph', 'heading'].includes(item.parent) && !['text', 'hardBreak'].includes(kind)) return null;
      if (item.parent === 'codeBlock' && kind !== 'text') return null;
      if (['orderedList', 'bulletList'].includes(item.parent) && kind !== 'listItem') return null;
      if (['doc', 'blockquote', 'listItem'].includes(item.parent) && ['text', 'hardBreak', 'listItem'].includes(kind)) return null;
      for (const child of children) stack.push({ value: child, depth: item.depth + 1, parent: kind });
    }
    if (new TextEncoder().encode(JSON.stringify(value)).length > 1048576) return null;
    return value as DocNode;
  } catch { return null; }
}

export function documentNodes(document: DocNode): DocNode[] {
  return [document, ...(document.content || []).flatMap(documentNodes)];
}
export function documentText(document: DocNode | null): string {
  return document ? documentNodes(document).filter(node => node.type === 'text').map(node => node.text || '').join(' ') : '';
}
export function assetIds(document: DocNode | null): number[] {
  return document ? [...new Set(documentNodes(document).filter(node => node.type.startsWith('custom')).map(node => node.attrs?.asset_id).filter((id): id is number => typeof id === 'number'))] : [];
}
export function assetUrls(document: DocNode | null): string[] {
  if (!document) return [];
  return [...new Set(documentNodes(document).flatMap(node => [
    ...(['image', 'audio'].includes(node.type) && typeof node.attrs?.src === 'string' ? [node.attrs.src] : []),
    ...(node.marks || []).filter(mark => mark.type === 'link' && typeof mark.attrs?.href === 'string').map(mark => mark.attrs!.href as string),
  ]))];
}
export function documentHeadings(document: DocNode | null) {
  return document ? documentNodes(document).filter(node => node.type === 'heading').map((node, index) => ({
    heading: documentNodes(node).filter(child => child.type === 'text').map(child => child.text || '').join('').trim(),
    id: documentHeadingId(index), level: Number(node.attrs?.level),
  })).filter(heading => heading.heading.length > 0) : [];
}

export const documentHeadingId = (index: number) => `article-heading-${index}`;
