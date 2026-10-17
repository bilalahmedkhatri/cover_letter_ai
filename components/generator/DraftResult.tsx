'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormState } from '@/contexts/FormStateContext';
import { historyRequest, historyDraft, type ConversationDetail } from '@/services/history';
import Link from 'next/link';
import { useGeneration, type DraftKind } from '@/contexts/GenerationContext';
import { useLocale } from '@/contexts/LocaleContext';
import { localizedPath } from '@/services/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLoading from '@/components/PageLoading';
import QualityReview from './QualityReview';
const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false, loading: () => <PageLoading label="Loading editor" /> });

export default function DraftResult({ kind }: { kind: DraftKind }) {
  const { drafts, setDrafts } = useGeneration();
  const { setUserData }=useFormState();
  const chatId=useSearchParams().get('chat');
  const [detail,setDetail]=useState<ConversationDetail | null>(null);
  const [loading,setLoading]=useState(!!chatId); const [historyError,setHistoryError]=useState('');
  useEffect(()=>{
    setDetail(null);setHistoryError('');
    if(!chatId){setLoading(false);return;}
    let active=true;let timer:ReturnType<typeof setTimeout>;
    setLoading(true);
    const load=async()=>{try{
      const result:ConversationDetail=await historyRequest('?id='+encodeURIComponent(chatId));
      if(result.workflow!==kind)throw new Error('This conversation belongs to a different writing workflow. Open it from chat history.');
      if(!active)return;
      setDetail(result);
      const latest=[...result.messages].reverse().find(message=>message.role==='assistant' && message.status==='completed');
      if(latest){const draft=historyDraft(result,latest,result.messages.find(message=>message.requestId===latest.requestId && message.role==='user')?.context || {});setDrafts(previous=>previous[kind]?.chatId===chatId && previous[kind]?.id===latest.id ? previous : {...previous,[kind]:draft});setUserData(previous=>({...previous,...draft.context}));}
      if(!latest){const lastUser=[...result.messages].reverse().find(message=>message.role==='user');if(lastUser)setUserData(previous=>({...previous,...historyDraft(result,lastUser,lastUser.context).context}));}
      if(result.messages.some(message=>message.status==='pending'))timer=setTimeout(load,5000);
    }catch(error){if(active)setHistoryError(error instanceof Error?error.message:'Could not load this chat.');}finally{if(active)setLoading(false);}};
    void load();return ()=>{active=false;clearTimeout(timer);};
  },[chatId,kind,setDrafts,setUserData]);
  const { locale } = useLocale();
  const draft = !chatId || drafts[kind]?.chatId===chatId ? drafts[kind] : undefined;
  const formPath = localizedPath(locale, kind==='cover-letter' ? '/dashboard' : `/dashboard/${kind}`) + (chatId ? `?chat=${chatId}` : '');
  if(loading && !draft)return <PageLoading label="Loading conversation"/>;
  if (!draft) return <Card className="mx-auto max-w-4xl"><CardHeader><CardTitle>{detail ? detail.messages.some(message=>message.status==='pending') ? 'Generating your draft…' : 'This chat has no completed draft' : 'No draft loaded'}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-text-secondary">{historyError || (detail ? detail.messages.some(message=>message.status==='pending') ? 'This request is still running. Its response will appear here when it completes.' : 'The last request may have failed or been interrupted. Continue this chat to submit a new request.' : 'Create a draft or open a conversation from chat history.')}</p><div className="flex flex-wrap gap-2"><Button asChild><Link href={formPath}>{detail ? 'Continue chat' : 'Create a draft'}</Link></Button></div></CardContent></Card>;
  return <div className="mx-auto w-full min-w-0 max-w-4xl space-y-4">
    {historyError && <p role="alert" className="text-sm text-destructive">{historyError}</p>}
    {draft.warning && <p role="alert" className="rounded-lg border p-3 text-sm text-destructive">{draft.warning}</p>}
    {draft.qualityWarning && <p role="alert" className="text-sm text-destructive">{draft.qualityWarning}</p>}
    <RichEditor value={draft.text} onChange={text => setDrafts(previous => previous[kind] ? { ...previous, [kind]: { ...previous[kind]!, text, reviewChanged:previous[kind]!.reviewChanged || text!==previous[kind]!.text } } : previous)} />
    {kind==='cover-letter' && <QualityReview review={draft.qualityReview} changed={draft.reviewChanged} />}
    {draft.sources.length > 0 && <Card><CardHeader><CardTitle>Sources to check</CardTitle></CardHeader><CardContent className="space-y-2">{draft.sources.map((source, index) => /^https?:\/\//.test(source.url) && <a key={index} className="block break-words text-sm underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span className="ms-2 text-xs text-text-secondary">Search source · verify</span></a>)}</CardContent></Card>}
  </div>;
}
