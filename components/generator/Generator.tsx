'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import { localizedPath } from '@/services/routing';
import { ArrowUp, Link2, X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Attachment } from '@/services/attachments';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormState } from '@/contexts/FormStateContext';
import { useGeneration } from '@/contexts/GenerationContext';
import { useDashboardAccount } from '@/components/dashboard/DashboardAccount';
import { workflows, wordTargets } from '@/services/workflow.mjs';
import { coverLetterLanguages, coverLetterWordTargets, parseCoverLetterInput } from '@/services/coverLetter.mjs';
import { coverLetterTemplateCopy } from '@/services/coverLetterTemplateCopy.mjs';
import { generationStatusCopy } from '@/services/generationStatusCopy';
import FormField from './FormField';
import ResumeUpload from './ResumeUpload';
export type Kind = 'cover-letter' | 'university' | 'email' | 'research';
function Choice({ id, value, onChange, options }: { id: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger id={id} className="w-full"><SelectValue placeholder="Choose an option" /></SelectTrigger><SelectContent>{options.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>;
}
export default function Generator({ kind, compact = false, onKindChange }: { kind: Kind; compact?: boolean; onKindChange?: (kind: Kind) => void }) {
  const isResearch = kind === 'research';
  const search = useSearchParams();
  const chatId = search.get('chat');
  const fresh = search.get('new');
  const pending = useRef<{payload:string;id:string} | null>(null);
  const requestVersion = useRef(0);
  const [draftPath, setDraftPath] = useState<string | null>(null);
  const [openingDraft, startNavigation] = useTransition();
  useEffect(() => { requestVersion.current++; pending.current=null; setDraftPath(null); setAttachments([]); setBusy(false); setError(''); return () => { requestVersion.current++; }; }, [kind,chatId,fresh]);
  const flow = workflows[kind] as { title: string; urlLabel: string; opportunity: string; kind: 'letter' | 'email' | 'research'; letterType: 'job' | 'university'; documentType: 'letter' | 'email' };
  const { userData, setUserData } = useFormState();
  const { setDrafts, setHistoryRevision, setIsLoading } = useGeneration();
  const router = useRouter();
  const { locale } = useLocale();
  const [templateSelection, setTemplateSelection] = useState<{ locale: typeof locale; language: string } | null>(null);
  useEffect(() => { setTemplateSelection(null); setSelectedTemplate(null); }, [locale]);
  function selectOutputLanguage(language: string) {
    setUserData(previous => ({ ...previous, language }));
    setTemplateSelection({ locale, language });
    setSelectedTemplate(null);
  }
  const { data, workflows: available } = useDashboardAccount();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const updateAttachments = (items: Attachment[]) => { if (items.some(item => item.image)) throw new Error('This gateway accepts text only. Upload a document or paste the image text.'); setAttachments(items); };
  const [urlOpen, setUrlOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const resumeText = attachments.filter(a => a.text).map(a => `${a.name}\n${a.text}`).join('\n\n');
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  function applyTemplate(prompt: string) {
    setUserData(previous=>({...previous,opportunityDescription:prompt}));
    setSelectedTemplate(null);
    requestAnimationFrame(()=>promptRef.current?.focus());
  }
  const description = userData.opportunityDescription || '';
  const recipient = userData.targetRecipient || '';
  const length = userData.outputLength || 'medium';
  const outputLanguages = kind === 'cover-letter' ? coverLetterLanguages : ['English', 'Russian', 'Spanish', 'French', 'Arabic', 'Dutch', 'Portuguese', 'Bulgarian', 'Hungarian', 'Slovak', 'Polish'];
  const outputLanguage = outputLanguages.includes(userData.language) ? userData.language : '';
  const templateCopy = coverLetterTemplateCopy(locale, templateSelection?.locale === locale ? templateSelection.language : undefined);
  const statusCopy = generationStatusCopy(locale);
  const url = (kind === 'university' || isResearch) ? userData.universityUrl : userData.opportunityUrl || '';
  useEffect(() => {
    if (userData.letterType !== flow.letterType || userData.documentType !== flow.documentType || userData.workflowKind !== kind) {
      if (isResearch) setAttachments([]);
      setUserData(p => ({ ...p, workflowKind: kind, letterType: flow.letterType, documentType: flow.documentType }));
    }
  }, [kind, flow.letterType, flow.documentType, userData.letterType, userData.documentType, userData.workflowKind, isResearch, setUserData]);
  useEffect(() => {
    if (data?.profile) setUserData(p => ({ ...p, name: p.name || data.profile.name, skills: p.skills || data.profile.skills, experience: p.experience || data.profile.experience }));
  }, [data?.profile, setUserData]);
  async function generate(e: React.FormEvent) {
    e.preventDefault(); const version = ++requestVersion.current; setBusy(true); setError(''); setDraftPath(null);
    setIsLoading(true); setHistoryRevision(value=>value+1);
    try {
      const values = isResearch ? {url,programme:userData.courseName || '',questions:description,language:userData.language} : { kind, name: compact ? '' : userData.name, skills: compact ? '' : userData.skills, experience: compact ? '' : userData.experience, language: outputLanguage, tone: userData.tone, customInstruction: compact ? '' : userData.customInstruction, length, recipient: compact ? '' : recipient, description, resumeText, images: attachments.flatMap(a => a.image ? [a.image] : []), url };
      const payload=JSON.stringify({...(kind === 'cover-letter' ? parseCoverLetterInput(values) : values),...(chatId ? {conversationId:chatId} : {})});
      if (pending.current?.payload!==payload) pending.current={payload,id:crypto.randomUUID()};
      const response = await fetch(isResearch ? '/api/research' : '/api/generate', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'x-generation-id':pending.current.id },
        body: payload,
      });
      const result = await response.json().catch(() => { throw new Error('The writing service returned an invalid response. Please try again.'); });
      if (!response.ok) { if(result.requestStatus!=='pending') pending.current=null; throw new Error(result.error || 'Unable to create your draft.'); }
      if (version === requestVersion.current) {
        setDrafts(previous => ({ ...previous, [kind]: { id: result.messageId || crypto.randomUUID(), chatId:result.conversationId, warning:result.historyWarning, qualityWarning:result.qualityWarning, qualityReview:result.qualityReview, text: result.text, title: result.title || flow.title, sources: result.sources || [], context: { ...userData, resume: null, opportunityUrl: url, workflowKind: kind } } }));
        pending.current=null;
        const path = localizedPath(locale, `/dashboard/${kind}/result`) + (result.conversationId ? `?chat=${encodeURIComponent(result.conversationId)}` : '');
        setDraftPath(path);
        startNavigation(() => router.push(path));
      }
    } catch (e) { if (version === requestVersion.current) setError(e instanceof Error ? e.message : 'Unable to create your draft.'); }
    finally { setIsLoading(false); setHistoryRevision(value=>value+1); if (version === requestVersion.current) setBusy(false); }
  }
  const setUrl = (value: string) => setUserData(p => ({ ...p, [(kind === 'university' || isResearch) ? 'universityUrl' : 'opportunityUrl']: value }));
  const addUrl = () => { setPendingUrl(url); setUrlError(''); setUrlOpen(true); };
  const placeholders = {
    'cover-letter': 'Write a cover letter for [role] at [company]. My name is [your name]. My relevant experience: [your main points and achievements]. Keep it professional and sign it [your signature].',
    university: 'Write an application letter for [programme] at [university]. My name is [your name]. My background, motivation and goals: [your main points]. Sign it [your signature].',
    research: 'Research [programme] at [university]. Check entry requirements, fees, scholarships and deadlines for [year]. Include official sources and mark anything that cannot be verified. Add the official programme URL using +.',
    email: 'Write an email to [recipient] about [purpose]. My name is [your name]. Include [your main points] and ask for [next step]. Sign it [your signature].',
  };
  return <div className="mx-auto w-full min-w-0 max-w-3xl">
    <form onSubmit={generate} aria-busy={busy || openingDraft}>
      <fieldset disabled={busy || openingDraft} className="min-w-0 space-y-4">
        <div className="text-center">
          {compact && <h2 className="text-2xl font-semibold tracking-tight">{isResearch ? 'Explore Universities' : 'Write Confidently'}</h2>}
        </div>
        {compact ? <div className="rounded-2xl border bg-muted/40 p-2 shadow-sm focus-within:border-emerald-500/50">
          <Textarea ref={promptRef} aria-label="Writing prompt" required rows={6} maxLength={6000} placeholder={placeholders[kind]} value={description} onChange={e => setUserData(p => ({ ...p, opportunityDescription: e.target.value }))} className="min-h-36 resize-none border-0 bg-transparent px-3 py-3 shadow-none focus-visible:ring-0 dark:bg-transparent" />
          {isResearch && !url && <p className="px-3 pb-2 text-xs text-text-secondary">Add an official programme URL using +.</p>}
          {url && <div className="mx-2 mb-2 flex min-w-0 items-center gap-1 text-xs"><Link2 className="size-3 shrink-0" /><span className="truncate">{url}</span><IconButton type="button" label="Remove URL" variant="ghost" className="size-6 shrink-0" onClick={() => setUrl('')}><X className="size-3" /></IconButton></div>}
          <ResumeUpload attachments={attachments} onChange={updateAttachments} onError={setError} onBusy={setUploading} onAddUrl={addUrl} disabled={busy} allowFiles={!isResearch} controls={<Select value={outputLanguage} onValueChange={selectOutputLanguage}><SelectTrigger aria-label="Output language" className="h-8 w-28 border-0 bg-transparent px-2 text-xs shadow-none sm:w-36"><SelectValue placeholder="Language" /></SelectTrigger><SelectContent>{outputLanguages.map(language=><SelectItem key={language} value={language}>{language}</SelectItem>)}</SelectContent></Select>} actions={<div className="flex items-center gap-2">
              {onKindChange && <Select value={kind} onValueChange={v => onKindChange(v as Kind)}><SelectTrigger aria-label="Writing type" className="h-8 max-w-40 border-0 bg-transparent px-2 text-xs shadow-none"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(workflows) as Kind[]).filter(key=>available.includes(key)).map(key => <SelectItem key={key} value={key}>{workflows[key].title}</SelectItem>)}</SelectContent></Select>}
              <IconButton label={openingDraft ? 'Opening draft' : isResearch ? "Research university" : "Generate draft"} type="submit" disabled={busy || openingDraft || uploading || !description.trim() || (isResearch && !url)} className="size-9 rounded-xl">{busy || openingDraft ? <Spinner label={openingDraft ? 'Opening draft' : 'Writing draft'} /> : <ArrowUp className="size-5" />}</IconButton>
          </div>} />
        </div> : <Card><CardContent className="space-y-4">
          {onKindChange && <FormField id="writing-type" label="Writing type"><Select value={kind} onValueChange={v => onKindChange(v as Kind)}><SelectTrigger id="writing-type" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(workflows) as Kind[]).filter(key=>available.includes(key)).map(key => <SelectItem key={key} value={key}>{workflows[key].title}</SelectItem>)}</SelectContent></Select></FormField>}
          <FormField id="name" label="Your name"><Input id="name" required maxLength={120} autoComplete="name" value={userData.name} onChange={e => setUserData(p => ({ ...p, name: e.target.value }))} /></FormField>
          <ResumeUpload attachments={attachments} onChange={updateAttachments} onError={setError} onBusy={setUploading} onAddUrl={addUrl} disabled={busy} />
          <FormField id="opportunity-url" label={compact ? 'Website URL (optional)' : flow.urlLabel}><Input id="opportunity-url" type="url" maxLength={2048} placeholder="https://…" value={url} onChange={e => setUserData(p => ({ ...p, [(kind === 'university' || isResearch) ? 'universityUrl' : 'opportunityUrl']: e.target.value }))} /></FormField>
          <FormField id="opportunity-description" label={compact ? 'Your main points' : flow.opportunity} hint="Include your purpose, relevant facts and the result you want. Paste important website details for accuracy."><Textarea id="opportunity-description" required={!url} rows={7} maxLength={6000} value={description} onChange={e => setUserData(p => ({ ...p, opportunityDescription: e.target.value }))} /></FormField>
          <FormField id="custom-instruction" label="Custom instructions (optional)"><Textarea id="custom-instruction" rows={2} maxLength={2000} placeholder="For example: focus on my career change and avoid a generic opening." value={userData.customInstruction} onChange={e => setUserData(p => ({ ...p, customInstruction: e.target.value }))} /></FormField>
          <details open={compact ? undefined : true} className="rounded-lg border p-4"><summary className="cursor-pointer text-sm font-medium">Writing settings & background</summary><div className="mt-4 space-y-4">
            <FormField id="background" label={kind === 'university' ? 'Academic background & motivation' : 'Experience & achievements'}><Textarea id="background" rows={3} maxLength={6000} value={userData.experience} onChange={e => setUserData(p => ({ ...p, experience: e.target.value }))} /></FormField>
            <FormField id="skills" label="Relevant skills"><Input id="skills" maxLength={4000} value={userData.skills} onChange={e => setUserData(p => ({ ...p, skills: e.target.value }))} /></FormField>
            <FormField id="recipient" label="Target recipient (optional)"><Input id="recipient" maxLength={160} value={recipient} onChange={e => setUserData(p => ({ ...p, targetRecipient: e.target.value }))} /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="tone" label="Tone"><Choice id="tone" value={userData.tone} options={['Formal', 'Concise', 'Enthusiastic', 'Professional']} onChange={tone => setUserData(p => ({ ...p, tone: tone as typeof p.tone }))} /></FormField>
              <FormField id="output-length" label="Output length"><Select value={length} onValueChange={outputLength => setUserData(p => ({ ...p, outputLength }))}><SelectTrigger id="output-length" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(kind === 'cover-letter' ? coverLetterWordTargets : wordTargets[kind === 'email' ? 'email' : 'letter']).map(([key, words]) => <SelectItem key={key} value={key}>{key} · {String(words)}</SelectItem>)}</SelectContent></Select></FormField>
            </div>
            <FormField id="language" label="Output language"><Choice id="language" value={outputLanguage} onChange={selectOutputLanguage} options={outputLanguages} /></FormField>
          </div></details>
          <p className="text-xs leading-5 text-text-secondary">Your inputs are sent to the writing provider when you generate. Review the draft before sending it.</p>
          <Button type="submit" disabled={busy || openingDraft || uploading} className="w-full">{(busy || openingDraft) && <Spinner label={openingDraft ? 'Opening draft' : 'Writing draft'} />}{openingDraft ? 'Opening your draft…' : busy ? 'Writing your draft…' : 'Generate draft'}</Button>
        </CardContent></Card>}
      </fieldset>
    </form>
    {(busy || openingDraft) && <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-4 end-4 z-50 flex w-[calc(100%_-_2rem)] max-w-sm items-start gap-3 rounded-xl border border-emerald-500/30 bg-card p-4 text-text-primary shadow-lg sm:bottom-6 sm:end-6">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-500"><Spinner /></span>
      <div className="min-w-0 space-y-1"><p className="text-sm font-semibold">{openingDraft ? statusCopy.opening : isResearch ? statusCopy.research : statusCopy.writing}</p><p className="text-xs leading-relaxed text-text-secondary">{statusCopy.wait}</p></div>
    </div>}
    {compact && kind==='cover-letter' && <section aria-label="Cover letter starter templates" className="mt-5 space-y-3">
      <p className="text-center text-sm text-text-secondary">{templateCopy.intro}</p>
      <div className="grid gap-2 sm:grid-cols-3">{templateCopy.templates.map(template=><Button key={template.title} type="button" variant="outline" disabled={busy || openingDraft} className="h-auto min-w-0 flex-col items-start gap-1 whitespace-normal px-4 py-3 text-start" onClick={()=>description.trim() ? setSelectedTemplate(template.prompt) : applyTemplate(template.prompt)}><span>{template.title}</span><span className="text-xs font-normal text-text-secondary">{template.hint}</span></Button>)}</div>
      <p className="text-center text-xs text-text-secondary">{templateCopy.tip}</p>
    </section>}
    <Dialog open={selectedTemplate!==null} onOpenChange={open=>{if(!open)setSelectedTemplate(null);}}><DialogContent><DialogHeader><DialogTitle>{templateCopy.replace}</DialogTitle><DialogDescription>{templateCopy.warning}</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={()=>setSelectedTemplate(null)}>{templateCopy.cancel}</Button><Button type="button" onClick={()=>{if(selectedTemplate)applyTemplate(selectedTemplate);}}>{templateCopy.use}</Button></div></DialogContent></Dialog>
    {draftPath && <p role="status" className="mt-4 text-sm text-text-secondary">{openingDraft ? 'Opening your draft…' : 'Your draft is ready.'} <Link href={draftPath} className="font-medium underline">Open draft</Link></p>}
    <Dialog open={!!error} onOpenChange={open => { if (!open) setError(''); }}><DialogContent><DialogHeader><DialogTitle>Unable to generate</DialogTitle><DialogDescription>{error}</DialogDescription></DialogHeader><Button type="button" onClick={() => setError('')}>Close</Button></DialogContent></Dialog>
    <Dialog open={urlOpen} onOpenChange={setUrlOpen}><DialogContent><DialogHeader><DialogTitle>Add website URL</DialogTitle><DialogDescription>Add a public job, programme or organisation link.</DialogDescription></DialogHeader>
      <Input aria-label="Website URL" type="url" maxLength={2048} placeholder="https://…" value={pendingUrl} onChange={e => setPendingUrl(e.target.value)} />
      {urlError && <p role="alert" className="text-sm text-destructive">{urlError}</p>}
      <Button type="button" onClick={() => { try { const parsed = new URL(pendingUrl.trim()); if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(); setUrl(pendingUrl.trim()); setUrlOpen(false); } catch { setUrlError('Enter an HTTP or HTTPS URL without credentials.'); } }}>Add URL</Button>
    </DialogContent></Dialog>
  </div>;
}
