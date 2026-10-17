import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createAccountStore} from '../server/accounts/store.mjs';
import {createAccountHandlers} from '../server/accounts/handlers.mjs';
import {createAIHandler} from '../server/ai/handler.mjs';
import {generateWithCoverLetterReview} from '../server/ai/cover-letter-review.mjs';
let db,store;
before(async()=>{db=new PGlite();for(const name of ['202610120002_accounts','202610160001_chat_history','202610160002_remove_saved_drafts'])await db.exec(await readFile(`prisma/migrations/${name}/migration.sql`,'utf8'));store=createAccountStore({},async(text,params)=>(await db.query(text,params)).rows);});
after(async()=>db.close());
const user=()=>({id:randomUUID()});
const input={kind:'cover-letter',name:'Alex',recipient:'Hiring team',description:'Write a letter from my verified web development experience.',resumeText:'',skills:'',experience:'',language:'English',url:'',tone:'Professional',length:'short'};
const start=(owner,options={})=>store.startConversation(owner,{requestId:randomUUID(),workflow:'cover-letter',input,...options});
const output={text:'A verified draft.',sources:[{url:'https://example.edu',title:'Official source',type:'search'}]};
const request=(data=input,requestId=randomUUID())=>new Request('https://app.example/api/generate',{method:'POST',headers:{origin:'https://app.example','Content-Type':'application/json','x-generation-id':requestId},body:JSON.stringify(data)});

test('history remains private after saved-document storage is removed',async()=>{
 const rows=(await db.query("SELECT relname,relrowsecurity FROM pg_class JOIN pg_namespace n ON n.oid=relnamespace WHERE n.nspname='app' AND relname IN ('conversations','messages','documents')")).rows;
 assert.deepEqual(rows.map(row=>row.relname).sort(),['conversations','messages']);assert.ok(rows.every(row=>row.relrowsecurity));
});
test('one generation persists its prompt and answer, sources and settings',async()=>{
 const owner=user();const requestId=randomUUID();const created=await start(owner,{requestId});assert.equal(created.state,'created');assert.equal(await store.finishConversation(owner,requestId,true,output),true);
 const detail=await store.conversation(owner,created.chat_id);assert.deepEqual(detail.messages.map(m=>m.role),['user','assistant']);assert.deepEqual(detail.messages.map(m=>m.status),['completed','completed']);assert.equal(detail.messages[0].content,input.description);assert.equal(detail.messages[0].context.language,'English');assert.equal(detail.messages[1].content,output.text);assert.deepEqual(detail.messages[1].sources,output.sources);
});

test('writing review metadata persists privately and replays without another generation or review',async()=>{
 const owner=user(),other=user(),requestId=randomUUID();let calls=0;
 const reviewed=await generateWithCoverLetterReview({operation:'standard',input},{generate:async()=>({text:++calls===1?'Dear team,\nA project.':JSON.stringify({checks:{factuality:true,grammar:true,language:true},issues:[]}),sources:[]})});
 const handler=createAIHandler({identity:async()=>owner,env:{NODE_ENV:'development',BILLING_SITE_URL:'https://app.example'},storeFactory:()=>store,generate:async()=>reviewed});
 const first=await handler(request(input,requestId));assert.equal(first.status,200);const data=await first.json();
 assert.equal(data.qualityWarning,undefined);assert.equal((await store.conversationReview(owner,requestId)).checks.grammar,'ai_no_issues_reported');
 assert.equal(await store.conversationReview(other,requestId),undefined);assert.equal(await store.saveConversationReview(other,requestId,reviewed.qualityReview),false);
 const replay=createAIHandler({identity:async()=>owner,env:{NODE_ENV:'development',BILLING_SITE_URL:'https://app.example'},storeFactory:()=>store,generate:async()=>{throw new Error('Must replay');}});
 assert.deepEqual((await (await replay(request(input,requestId))).json()).qualityReview,data.qualityReview);
 const detail=await store.conversation(owner,data.conversationId);assert.equal(detail.messages.find(m=>m.role==='assistant').context.qualityReview.version,'cover-letter-review.v1');
});
test('duplicate request IDs replay completed output and reject pending or conflicting inputs',async()=>{
 const owner=user();const requestId=randomUUID();const one=await start(owner,{requestId});assert.equal((await start(owner,{requestId})).state,'pending');
 assert.equal((await start(owner,{requestId,input:{...input,description:'Different'}})).state,'conflict');await store.finishConversation(owner,requestId,true,output);
 const replay=await start(owner,{requestId});assert.equal(replay.state,'completed');assert.equal(replay.chat_id,one.chat_id);assert.equal(replay.answer,output.text);assert.equal((await store.conversation(owner,one.chat_id)).messages.length,2);
});
test('other users cannot read, append to, rename, delete or settle a conversation',async()=>{
 const alice=user(),bob=user(),requestId=randomUUID();const chat=await start(alice,{requestId});
 for(const action of [()=>store.conversation(bob,chat.chat_id),()=>store.renameConversation(bob,chat.chat_id,'Wrong'),()=>store.removeConversation(bob,chat.chat_id)])await assert.rejects(action(),e=>e.status===404);
 assert.equal((await start(bob,{chatId:chat.chat_id})).state,'missing');assert.equal((await start(bob,{requestId})).state,'conflict');assert.equal(await store.finishConversation(bob,requestId,true,output),false);assert.equal((await store.conversations(bob)).items.length,0);
});
test('concurrent submissions claim a single request and do not overlap pending turns in one chat',async()=>{
 const owner=user(),requestId=randomUUID();const rows=await Promise.all(Array.from({length:6},()=>start(owner,{requestId})));assert.equal(rows.filter(row=>row.state==='created').length,1);assert.equal(rows.filter(row=>row.state==='pending').length,5);
 assert.equal((await start(owner,{chatId:rows[0].chat_id})).state,'pending');assert.equal((await store.conversation(owner,rows[0].chat_id)).messages.length,2);
});
test('failed and abandoned requests remain visible and cannot be delivered twice',async()=>{
 const owner=user(),requestId=randomUUID();const chat=await start(owner,{requestId});await store.finishConversation(owner,requestId,false,{text:'Gateway failed',sources:[]});assert.equal((await start(owner,{requestId})).state,'failed');assert.equal(await store.finishConversation(owner,requestId,true,output),false);
 const nextId=randomUUID();await start(owner,{chatId:chat.chat_id,requestId:nextId});await db.query("UPDATE app.messages SET created_at=created_at-interval '6 minutes' WHERE request_id=$1",[nextId]);assert.ok((await store.conversation(owner,chat.chat_id)).messages.some(m=>m.status==='interrupted'));assert.equal((await start(owner,{chatId:chat.chat_id,requestId:nextId})).state,'failed');
});
test('conversation and message cursors return older records without duplication',async()=>{
 const owner=user();for(let i=0;i<22;i++)await start(owner);const first=await store.conversations(owner);assert.equal(first.items.length,20);assert.ok(first.cursor);const last=await store.conversations(owner,first.cursor);assert.equal(last.items.length,2);assert.equal(new Set([...first.items,...last.items].map(x=>x.id)).size,22);
 const other=user();let chatId;for(let i=0;i<26;i++){const requestId=randomUUID();const created=await start(other,{chatId,requestId});chatId=created.chat_id;await store.finishConversation(other,requestId,true,output);}
 const recent=await store.conversation(other,chatId);assert.equal(recent.messages.length,50);const earlier=await store.conversation(other,chatId,recent.cursor);assert.equal(earlier.messages.length,2);assert.equal(new Set([...earlier.messages,...recent.messages].map(x=>x.id)).size,52);
});
test('rename is owner-scoped and deleting a conversation cascades its messages',async()=>{
 const owner=user(),chat=await start(owner);await store.renameConversation(owner,chat.chat_id,'Renamed chat');assert.equal((await store.conversation(owner,chat.chat_id)).title,'Renamed chat');await store.removeConversation(owner,chat.chat_id);assert.equal((await db.query('SELECT count(*)::int AS n FROM app.messages WHERE conversation_id=$1',[chat.chat_id])).rows[0].n,0);await assert.rejects(store.conversation(owner,chat.chat_id),e=>e.status===404);
});
test('generation handler stores once, replays without another AI call and passes bounded real history',async()=>{
 const owner=user(),requestId=randomUUID();let calls=0;const handler=createAIHandler({identity:async()=>owner,env:{BILLING_SITE_URL:'https://app.example'},storeFactory:()=>store,generate:async job=>{calls++;if(calls===2)assert.equal(job.history.length,2);return output;}});
 const one=await handler(request(input,requestId));assert.equal(one.status,200);const result=await one.json();assert.equal(result.historySaved,true);assert.ok(result.conversationId);
 const replay=await handler(request(input,requestId));assert.equal(replay.status,200);assert.equal((await replay.json()).text,output.text);assert.equal(calls,1);
 assert.equal((await handler(request({...input,conversationId:result.conversationId}))).status,200);assert.equal(calls,2);
});
test('provider failures are recorded, while a completion-storage failure preserves delivered output with a warning',async()=>{
 const owner=user();const failed=createAIHandler({identity:async()=>owner,env:{BILLING_SITE_URL:'https://app.example'},storeFactory:()=>store,generate:async()=>{throw new Error('Private upstream body');}});
 const response=await failed(request());assert.equal(response.status,503);const result=await response.json();assert.equal(result.requestStatus,'failed');assert.ok(!result.error.includes('Private'));assert.equal((await store.conversation(owner,result.conversationId)).messages.at(-1).status,'failed');
 const broken={...store,finishConversation:async()=>{throw new Error('Storage down');}};let calls=0;const handler=createAIHandler({identity:async()=>owner,env:{BILLING_SITE_URL:'https://app.example'},storeFactory:()=>broken,generate:async()=>{calls++;return output;}});const id=randomUUID();const generated=await (await handler(request(input,id))).json();assert.equal(generated.text,output.text);assert.equal(generated.historySaved,false);assert.match(generated.historyWarning,/Copy or export/);assert.equal((await handler(request(input,id))).status,409);assert.equal(calls,1);
});
test('history API validates sessions, origins, cursors and mutations without exposing other owners',async()=>{
 const owner=user();const chat=await start(owner);const handlers=createAccountHandlers({identity:async()=>owner,env:{BILLING_SITE_URL:'https://app.example'},store});
 assert.equal((await createAccountHandlers({identity:async()=>null,store}).history(new Request('https://app.example/api/history'))).status,401);
 assert.equal((await handlers.history(new Request('https://app.example/api/history?id=bad'))).status,400);
 assert.equal((await handlers.history(new Request('https://app.example/api/history?before=bad'))).status,400);
 const mutation=(value,origin='https://app.example')=>new Request('https://app.example/api/history',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(value)});
 assert.equal((await handlers.history(mutation({action:'delete',id:chat.chat_id},'https://evil.example'))).status,403);
 assert.equal((await handlers.history(mutation({action:'rename',id:chat.chat_id,title:' '}))).status,400);
 assert.equal((await handlers.history(mutation({action:'rename',id:chat.chat_id,title:'My chat'}))).status,200);
});
