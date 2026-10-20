// Optional display metadata must never invalidate an otherwise usable letter.
export function normalizeConversationTitle(value) {
  if (typeof value !== 'string' || !value.isWellFormed()) return undefined;
  const title = value.replace(/\s+/gu, ' ').trim();
  if (!title || Array.from(title).length > 80 || title.split(' ').length > 7) return undefined;
  if (/[<>\u0000-\u0008\u000e-\u001f\u007f]/u.test(title) || /https?:\/\/|www\.|\S+@\S+|(?:\d[\s().+-]*){7,}/iu.test(title)) return undefined;
  return title;
}
