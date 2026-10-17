'use client';
import { useRef, useState, type ReactNode } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Plus, Paperclip, Link2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
import { Spinner } from '@/components/ui/spinner';
import { readAttachment, attachmentAccept, type Attachment } from '@/services/attachments';

export default function ResumeUpload({ attachments, onChange, onBusy, onAddUrl, onError, actions, controls, disabled = false, allowFiles = true }: {
  attachments: Attachment[]; onChange: (attachments: Attachment[]) => void;
  onBusy: (busy: boolean) => void; onAddUrl: () => void; onError?: (message: string) => void; actions?: ReactNode; controls?: ReactNode; disabled?: boolean; allowFiles?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(''); setBusy(true); onBusy(true);
    try {
      if (attachments.length + files.length > 5) throw new Error('Attach up to 5 files.');
      const added: Attachment[] = [];
      for (const file of Array.from(files)) added.push(await readAttachment(file));
      const next = [...attachments, ...added];
      if (next.filter(a => a.image).length > 3) throw new Error('Attach up to 3 images.');
      if (next.map(a => a.text ? `${a.name}\n${a.text}` : '').join('\n\n').length > 12000) throw new Error('Documents contain too much text. Choose shorter files or paste the key points.');
      onChange(next);
    } catch (e) { const message = e instanceof Error ? e.message : 'Unable to read your files.'; if (onError) onError(message); else setError(message); }
    finally { setBusy(false); onBusy(false); if (input.current) input.current.value = ''; }
  }
  return <div className="min-w-0 space-y-2">
    {attachments.length > 0 && <div className="flex flex-wrap items-center gap-2">{attachments.map(a => <span key={a.id} className="inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-1 text-xs"><Paperclip className="size-3 shrink-0" /><span className="max-w-36 truncate">{a.name}</span><IconButton type="button" label={`Remove ${a.name}`} variant="ghost" className="size-5" disabled={disabled || busy} onClick={() => onChange(attachments.filter(item => item.id !== a.id))}><X className="size-3" /></IconButton></span>)}</div>}
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1"><DropdownMenu.Root><DropdownMenu.Trigger asChild><IconButton type="button" label="Add URL or files" variant="ghost" disabled={disabled || busy}>{busy ? <Spinner label="Reading files" /> : <Plus className="size-5" />}</IconButton></DropdownMenu.Trigger>
        <DropdownMenu.Portal><DropdownMenu.Content align="start" sideOffset={8} className="z-50 min-w-48 rounded-xl border bg-card p-1 text-sm shadow-lg">
          <DropdownMenu.Item onSelect={onAddUrl} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 outline-none focus:bg-muted"><Link2 className="size-4" />Add URL</DropdownMenu.Item>
          {allowFiles && <DropdownMenu.Item onSelect={() => input.current?.click()} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 outline-none focus:bg-muted"><Paperclip className="size-4" />Upload files</DropdownMenu.Item>}
        </DropdownMenu.Content></DropdownMenu.Portal>
      </DropdownMenu.Root>{controls}</div>
      {actions}

    </div>
    <Input ref={input} className="hidden" tabIndex={-1} aria-label="Upload supporting files" type="file" multiple accept={attachmentAccept} disabled={disabled || busy} onChange={e => void upload(e.target.files)} />
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}
