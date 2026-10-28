import React, { createElement, type ReactNode } from 'react';
import { validateDocument, type DocNode } from './document';
import type { BlogAsset } from './types';
import { mediaUrl, safeLink, youtubeUrl } from './urls';
import { articleHeadingId } from './article';

export interface ContentStyle {
  root?: string; paragraph?: string; heading?: string; link?: string; list?: string;
  blockquote?: string; code?: string; rule?: string; figure?: string; image?: string;
  video?: string; audio?: string; caption?: string; embed?: string;
  tableRegion?: string; table?: string; row?: string; cell?: string; headerCell?: string;
}
export interface ContentLabels { unsupported: string; video: string; audio: string; table: string; youtube: string }

const label = (value: unknown) => typeof value === 'string' ? value.slice(0, 1000) : '';
const attachmentTypes = new Set(['application/pdf', 'text/plain', 'text/csv', 'application/zip',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']);

// Framework-neutral React renderer: all styling, language and media policy are
// injected by the consumer. Only allowlisted attributes reach HTML elements.
export function BlogContent({ document: input, schemaVersion, assets, mediaOrigins, styles, labels }: {
  document: unknown; schemaVersion: number; assets: BlogAsset[]; mediaOrigins: readonly string[];
  styles: ContentStyle; labels: ContentLabels;
}) {
  const document = validateDocument(input, schemaVersion);
  if (!document) return <p role="status">{labels.unsupported}</p>;
  const byId = new Map(assets.map(asset => [asset.id, asset]));
  const byUrl = new Map(assets.map(asset => [asset.publicUrl, asset]));
  let headingIndex = 0;
  const resolveAsset = (node: DocNode) => typeof node.attrs?.asset_id === 'number'
    ? byId.get(node.attrs.asset_id)
    : typeof node.attrs?.src === 'string' ? byUrl.get(node.attrs.src) : undefined;

  function render(node: DocNode, key: number): ReactNode {
    const attrs = node.attrs || {};
    const headingId = node.type === 'heading' ? articleHeadingId(headingIndex++) : undefined;
    const children = (node.content || []).map(render);
    if (node.type === 'text') {
      let text: ReactNode = node.text;
      for (const mark of node.marks || []) {
        const tag = ({ bold: 'strong', italic: 'em', underline: 'u', strike: 's', code: 'code' } as Record<string, string>)[mark.type];
        if (tag) text = createElement(tag, {}, text);
        if (mark.type === 'link') {
          const href = safeLink(mark.attrs?.href);
          if (href) text = <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>{text}</a>;
        }
      }
      return <React.Fragment key={key}>{text}</React.Fragment>;
    }
    if (node.type === 'doc') return <React.Fragment key={key}>{children}</React.Fragment>;
    if (node.type === 'paragraph') {
      // Official editor uploads may represent videos as one ordinary link.
      const child = node.content?.length === 1 ? node.content[0] : undefined;
      const href = child?.marks?.find(mark => mark.type === 'link')?.attrs?.href;
      const video = typeof href === 'string' ? byUrl.get(href) : undefined;
      const src = video?.mediaType.startsWith('video/') ? mediaUrl(video.publicUrl, mediaOrigins) : undefined;
      if (src) return <figure key={key} className={styles.figure}><video controls preload="metadata" aria-label={label(child?.text) || labels.video} className={styles.video}><source src={src} type={video!.mediaType} /></video></figure>;
      return <p key={key} className={styles.paragraph}>{children}</p>;
    }
    if (node.type === 'heading') return createElement(`h${attrs.level}`, { key, id: headingId, className: styles.heading }, children);
    if (node.type === 'hardBreak') return <br key={key} />;
    if (node.type === 'horizontalRule') return <hr key={key} className={styles.rule} />;
    if (node.type === 'bulletList') return <ul key={key} className={styles.list} style={{ listStyleType: 'disc' }}>{children}</ul>;
    if (node.type === 'orderedList') return <ol key={key} start={typeof attrs.start === 'number' ? attrs.start : 1} type={attrs.type as '1' | 'a' | 'A' | 'i' | 'I' || '1'} className={styles.list}>{children}</ol>;
    if (node.type === 'listItem') return <li key={key}>{children}</li>;
    if (node.type === 'blockquote') return <blockquote key={key} className={styles.blockquote}>{children}</blockquote>;
    if (node.type === 'codeBlock') return <pre key={key} className={styles.code}><code>{children}</code></pre>;
    if (node.type === 'table') return <div key={key} tabIndex={0} role="region" aria-label={labels.table} className={styles.tableRegion}><table className={styles.table}><tbody>{children}</tbody></table></div>;
    if (node.type === 'tableRow') return <tr key={key} className={styles.row}>{children}</tr>;
    if (node.type === 'tableCell' || node.type === 'tableHeader') return createElement(node.type === 'tableHeader' ? 'th' : 'td', {
      key, colSpan: Number(attrs.colspan ?? 1), rowSpan: Number(attrs.rowspan ?? 1),
      style: { textAlign: attrs.align as 'left' | 'center' | 'right' || 'start' },
      className: node.type === 'tableHeader' ? styles.headerCell : styles.cell,
    }, children);

    if (node.type === 'youtube' || (node.type === 'customVideo' && attrs.asset_id == null)) {
      const embed = youtubeUrl(attrs.src);
      const start = Number.isInteger(attrs.start) && Number(attrs.start) > 0 ? `?start=${attrs.start}` : '';
      return embed ? <iframe key={key} src={embed + start} title={label(attrs.title) || labels.youtube} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className={styles.embed} /> : null;
    }
    const asset = resolveAsset(node);
    const src = asset && mediaUrl(asset.publicUrl, mediaOrigins);
    if (!asset || !src) return null;
    let media: ReactNode;
    if (['customImage', 'image'].includes(node.type) && asset.mediaType.startsWith('image/') && asset.mediaType !== 'image/svg+xml') media = <img src={src} alt={asset.alt || label(attrs.alt) || asset.filename} width={asset.width || undefined} height={asset.height || undefined} loading="lazy" decoding="async" className={styles.image} />;
    else if (node.type === 'customVideo' && asset.mediaType.startsWith('video/')) media = <video controls preload="metadata" aria-label={asset.caption || asset.filename || labels.video} className={styles.video}><source src={src} type={asset.mediaType} /><a href={src}>{labels.video}</a></video>;
    else if (['customAudio', 'audio'].includes(node.type) && asset.mediaType.startsWith('audio/')) media = <audio controls preload="none" aria-label={asset.caption || asset.filename || labels.audio} className={styles.audio}><source src={src} type={asset.mediaType} /><a href={src}>{labels.audio}</a></audio>;
    else if (node.type === 'customFileAttachment' && attachmentTypes.has(asset.mediaType)) media = <a href={src} target="_blank" rel="noopener noreferrer" download className={styles.link}>{asset.filename}</a>;
    else return null;
    const caption = asset.caption || label(attrs.caption);
    return <figure key={key} className={styles.figure}>{media}{caption && <figcaption className={styles.caption}>{caption}</figcaption>}</figure>;
  }
  return <div className={styles.root}>{render(document, 0)}</div>;
}
