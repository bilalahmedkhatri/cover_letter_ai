import { accountRequest } from './authClient';
import type { DraftKind, GeneratedDraft } from '@/contexts/GenerationContext';
import { readCoverLetterQuality } from './coverLetterReview.mjs';
export type HistoryCursor = { at: string; id: string } | null;
export type Conversation = { id: string; workflow: DraftKind; title: string; updatedAt: string; status?: string };
export type ChatMessage = { id: string; requestId: string; role: 'user' | 'assistant'; content: string; status: string; context: Record<string, unknown>; sources: GeneratedDraft['sources']; createdAt: string };
export type ConversationDetail = Conversation & { messages: ChatMessage[]; cursor: HistoryCursor };
export const historyRequest = (query = '', value?: object) => accountRequest(value, '/api/history' + query);
export const historyCursor = (cursor: HistoryCursor) => cursor ? `&before=${encodeURIComponent(cursor.at)}&beforeId=${cursor.id}` : '';
export function historyDraft(chat: Conversation, message: ChatMessage, input: Record<string, unknown>): GeneratedDraft {
  return { id: message.id, chatId: chat.id, title: chat.title, text: message.content, sources: message.sources || [], qualityReview:readCoverLetterQuality(message.context?.qualityReview), context: {
    ...input, opportunityDescription: input.description || input.questions || '', targetRecipient: input.recipient || '', outputLength: input.length || 'medium',
    opportunityUrl: input.url || '', universityUrl: input.url || '', courseName: input.programme || '', workflowKind: chat.workflow,
    letterType: ['university','research'].includes(chat.workflow) ? 'university' : 'job', documentType: chat.workflow === 'email' ? 'email' : 'letter', resume: null,
  } };
}
