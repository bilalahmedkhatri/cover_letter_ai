'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { History, MessageSquare, MoreHorizontal } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, useSidebar } from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useGeneration } from '@/contexts/GenerationContext';
import { useAccount } from '@/contexts/AccountContext';
import { useLocale } from '@/contexts/LocaleContext';
import { historyRequest, historyCursor, type Conversation, type HistoryCursor } from '@/services/history';

export default function ChatHistory({ collapsed }: { collapsed: boolean }) {
  const { user } = useAccount(); const { locale } = useLocale(); const router = useRouter();
  const selected=useSearchParams().get('chat');
  const { setOpen, setOpenMobile }=useSidebar();
  const { historyRevision,setHistoryRevision,setDrafts }=useGeneration();
  const [items,setItems]=useState<Conversation[]>([]); const [cursor,setCursor]=useState<HistoryCursor>(null);
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [fetching,setFetching]=useState(false);
  const [action,setAction]=useState<{chat:Conversation;type:'rename'|'delete'} | null>(null); const [title,setTitle]=useState(''); const [actionError,setActionError]=useState('');
  useEffect(()=>{setItems([]);setCursor(null);setError('');setFetching(false);},[user?.id]);
  useEffect(()=>{
    if (!user) return;
    let active=true,running=false;
    const load=async()=>{if(running)return;running=true;setFetching(true);try{const result=await historyRequest();if(active){setItems(result.items);setCursor(result.cursor);setError('');}}catch{if(active)setError('Chat history is temporarily unavailable.');}finally{running=false;if(active)setFetching(false);}};
    void load();
    return ()=>{active=false;};
  },[user?.id,historyRevision]);
  async function more() {
    setBusy(true);try{const result=await historyRequest('?'+historyCursor(cursor).slice(1));setItems(previous=>[...previous,...result.items.filter((item:Conversation)=>!previous.some(existing=>existing.id===item.id))]);setCursor(result.cursor);setError('');}catch{setError('Could not load earlier chats.');}finally{setBusy(false);}
  }
  async function mutate() {
    if(!action)return;setBusy(true);setActionError('');
    try{
      await historyRequest('',{action:action.type,id:action.chat.id,...(action.type==='rename'?{title}: {})});
      if(action.type==='delete'){
        setDrafts(previous=>Object.fromEntries(Object.entries(previous).filter(([,draft])=>draft?.chatId!==action.chat.id)));
        if(selected===action.chat.id)router.replace(`/${locale}/dashboard`);
      }
      setAction(null);setHistoryRevision(value=>value+1);
    }catch(error){setActionError(error instanceof Error?error.message:'Unable to update chat.');}finally{setBusy(false);}
  }
  if(collapsed)return <SidebarGroup><SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="Chat history" onClick={()=>setOpen(true)} aria-label="Open chat history"><History/></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup>;
  return <SidebarGroup>
    <SidebarGroupLabel>Chat history</SidebarGroupLabel>
    {error && <p role="status" className="px-2 text-xs text-destructive">{error}</p>}
    {fetching && <div className="flex justify-center py-2"><Spinner label="Loading chat history"/></div>}
    {!fetching && !error && !items.length && <p className="px-2 text-xs text-text-secondary">Your generated chats will appear here.</p>}
    <SidebarMenu>{items.map(chat=>{
      return <SidebarMenuItem key={chat.id}>
        <SidebarMenuButton asChild isActive={selected===chat.id} tooltip={chat.title}><Link href={`/${locale}/dashboard/${chat.workflow}/result?chat=${chat.id}`} onClick={()=>setOpenMobile(false)}><MessageSquare/><span className="truncate pe-5">{chat.title}</span>{chat.status==='pending' && <Spinner label="Generating"/>}</Link></SidebarMenuButton>
        <DropdownMenu.Root><DropdownMenu.Trigger asChild><SidebarMenuAction aria-label={`Options for ${chat.title}`}><MoreHorizontal/></SidebarMenuAction></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" className="z-50 rounded-lg border bg-card p-1 text-sm shadow-lg">{(['rename','delete'] as const).map(type=><DropdownMenu.Item key={type} className="cursor-pointer rounded px-3 py-2 outline-none focus:bg-muted" onSelect={()=>{setAction({chat,type});setTitle(chat.title);setActionError('');}}>{type==='rename'?'Rename chat':'Delete chat'}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
        {['failed','interrupted'].includes(chat.status || '') && <p className="px-2 text-xs text-destructive">{chat.status==='interrupted'?'Interrupted':'Generation failed'}</p>}
      </SidebarMenuItem>;
    })}</SidebarMenu>
    {cursor && <Button variant="ghost" disabled={busy} onClick={()=>void more()}>{busy ? <Spinner label="Loading older chats"/> : 'Load older chats'}</Button>}
    <Dialog open={!!action} onOpenChange={open=>{if(!open && !busy)setAction(null);}}><DialogContent><DialogHeader><DialogTitle>{action?.type==='rename'?'Rename chat':'Delete chat'}</DialogTitle><DialogDescription>{action?.type==='rename'?'Choose a title for this conversation.':'This removes this conversation and its messages.'}</DialogDescription></DialogHeader>{action?.type==='rename' && <Input aria-label="Chat title" maxLength={160} value={title} onChange={event=>setTitle(event.target.value)}/>} {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={()=>setAction(null)}>Cancel</Button><Button variant={action?.type==='delete'?'destructive':'default'} disabled={busy || (action?.type==='rename' && !title.trim())} onClick={()=>void mutate()}>{busy?'Saving…':action?.type==='rename'?'Save title':'Delete chat'}</Button></div></DialogContent></Dialog>
  </SidebarGroup>;
}
