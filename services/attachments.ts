import { readResume } from './resume';

export type ImageAttachment = { mimeType: string; data: string };
export type Attachment = { id: string; name: string; text: string; image?: ImageAttachment };
export const attachmentAccept = '.docx,.xlsx,.xls,.csv,.txt,.pdf,.png,.jpg,.jpeg,.webp';
export async function readAttachment(file: File): Promise<Attachment> {
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose files smaller than 5 MB each.');
  const ext = file.name.split('.').pop()?.toLowerCase();
  const attachment = { id: crypto.randomUUID(), name: file.name, text: '' };
  if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) return { ...attachment, text: await readResume(file) };
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to read this image.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
    if (data.length > 700000) throw new Error('Image is too detailed. Upload a smaller image.');
    return { ...attachment, image: { mimeType: 'image/jpeg', data } };
  } finally { bitmap.close(); }
}
