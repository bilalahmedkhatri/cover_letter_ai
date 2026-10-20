import { validateGeneration, validateResearch } from '../../services/workflow.mjs';
import { body } from '../payments/http.mjs';
import { PaymentError } from '../payments/nowpayments.mjs';
import { gatewayQuery } from './providers.mjs';
import { generateWithCoverLetterReview } from './cover-letter-review.mjs';
import { createAccountStore } from '../accounts/store.mjs';
import { randomUUID } from 'node:crypto';
import { canUseWorkflow } from '../feature-access.mjs';
import { coverLetterPromptVersion } from '../../services/coverLetter.mjs';
import { coverLetterReviewVersion, readCoverLetterQuality } from '../../services/coverLetterReview.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createAIHandler({research=false,identity,env=process.env,generate=generateWithCoverLetterReview,storeFactory=()=>createAccountStore(env)}) {
  return async request => {
    let store,user,started,requestId;
    try {
      user = await identity();
      if (!user) throw new PaymentError('Sign in to generate a draft or research report.',401);
      const origin = env.NODE_ENV === 'development' ? new URL(request.url).origin : new URL(env.BILLING_SITE_URL || 'https://ailettergen.com').origin;
      if (request.headers.get('origin') !== origin) throw new PaymentError('Invalid request origin.',403);
      let input,raw;
      try { raw=await body(request,research ? 65536 : 3000000); input = (research ? validateResearch : validateGeneration)(raw); }
      catch (error) { if (error instanceof PaymentError) throw error; throw new PaymentError(error instanceof Error ? error.message : 'Invalid input.'); }
      if (input.kind === 'cover-letter') input = {...input,promptVersion:coverLetterPromptVersion,reviewVersion:coverLetterReviewVersion};
      const operation = research ? 'research' : input.operation;
      if (!canUseWorkflow(research?'research':input.kind,user,env)) throw new PaymentError('Feature not found.',404);
      gatewayQuery({operation,input},{env});
      requestId=request.headers.get('x-generation-id') || randomUUID();
      if (!uuid.test(requestId) || (raw.conversationId!==undefined && !uuid.test(raw.conversationId))) throw new PaymentError('Invalid conversation request.',400);
      store=storeFactory();
      started=await store.startConversation(user,{chatId:raw.conversationId,requestId,workflow:research?'research':input.kind,input});
      if (started.state==='missing') throw new PaymentError('Conversation not found.',404);
      if (started.state==='conflict') throw new PaymentError('This request ID belongs to a different request.',409);
      if (started.state==='pending') throw new PaymentError('This conversation is still generating. Open it from chat history to check its status.',409);
      if (started.state==='failed') throw new PaymentError('The previous request failed. Submit again to create a new attempt.',409);
      if (started.state==='completed') {
        let qualityReview;
        if(input.kind==='cover-letter'){
          if(store.conversationReview)qualityReview=await store.conversationReview(user,requestId);
          else {
            const detail=await store.conversation(user,started.chat_id);
            qualityReview=readCoverLetterQuality(detail.messages.find(message=>message.id===started.message_id)?.context?.qualityReview);
          }
        }
        return Response.json({text:started.answer,sources:started.answer_sources,qualityReview,operation,conversationId:started.chat_id,messageId:started.message_id,historySaved:true},{headers:{'Cache-Control':'no-store'}});
      }
      const detail=await store.conversation(user,started.chat_id);
      const history=detail.messages.filter(message=>message.status==='completed').slice(-6).map(({role,content})=>({role,content}));
      const output = await generate({operation,input,history,requestId},{env});
      const {title:proposedTitle,...draftOutput}=output;
      let historySaved=false;
      try { historySaved=await store.finishConversation(user,requestId,true,output); }
      catch { console.error('Chat result could not be saved',{requestId}); }
      let title;
      if(input.kind==='cover-letter' && historySaved && proposedTitle){
        try { title=await store.saveConversationTitle?.(user,requestId,proposedTitle); }
        catch { console.error('Chat title could not be saved',{requestId}); }
      }
      let reviewSaved=false;
      if(output.qualityReview && historySaved){
        try { reviewSaved=await store.saveConversationReview?.(user,requestId,output.qualityReview) === true; }
        catch { console.error('Writing review could not be saved',{requestId}); }
      }
      return Response.json({...draftOutput,...(title ? {title} : {}),operation,conversationId:started.chat_id,messageId:started.message_id,historySaved,
        ...(output.qualityReview && !reviewSaved ? {qualityWarning:'Review details could not be saved. Keep this page open to inspect them.'} : {}),
        ...(!historySaved ? {historyWarning:'Your draft was generated but could not be saved to chat history. Copy or export it before leaving this page.'} : {})},{headers:{'Cache-Control':'no-store'}});
    } catch (error) {
      if (started?.state==='created') {
        try { await store.finishConversation(user,requestId,false,{text:error instanceof PaymentError ? error.message : 'Generation failed. Please try again.',sources:[]}); }
        catch { console.error('Chat failure status could not be saved',{requestId}); }
      }
      return Response.json({error:error instanceof PaymentError ? error.message : started ? 'Unable to complete this request. Please try again.' : 'Unable to start or restore chat history. No AI request was sent.',
        ...(started?.chat_id ? {conversationId:started.chat_id,requestStatus:started.state==='created'?'failed':started.state} : {})},
        {status:error instanceof PaymentError ? error.status : 503,headers:{'Cache-Control':'no-store',...(error.status===429 && error.retryAfter ? {'Retry-After':String(error.retryAfter)} : {})}});
    }
  };
}
