import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createAccountStore } from '../server/accounts/store.mjs';
import { createAIHandler } from '../server/ai/handler.mjs';
let db, store;
const user = { id: 'alice' }, other = { id: 'bob' };
const input = { kind:'cover-letter', name:'Alex', description:'Write a letter from my verified project experience.', language:'English' };
const output = { text:'A draft.', sources:[] };
const start = (owner=user, requestId=randomUUID()) => store.startConversation(owner,{requestId,workflow:'cover-letter',input});
const limited = error => error.status===429;
before(async()=>{
  db=new PGlite();
  for(const name of ['202610120002_accounts','202610160001_chat_history','202610190001_conversation_titles','202610200001_generation_abuse_guards']) await db.exec(await readFile(`prisma/migrations/${name}/migration.sql`,'utf8'));
  store=createAccountStore({},async(sql,args)=>(await db.query(sql,args)).rows);
});
beforeEach(async()=>db.exec('TRUNCATE app.conversations,app.generation_guards CASCADE'));
after(async()=>db.close());

test('ten new requests per sliding minute; completed replay and other owners are independent',async()=>{
  const ids=[];
  for(let i=0;i<10;i++){
    const id=randomUUID();ids.push(id);await start(user,id);await store.finishConversation(user,id,true,output);
  }
  await assert.rejects(start(),limited);
  assert.equal((await start(user,ids[0])).state,'completed');
  assert.equal((await start(other)).state,'created');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM app.conversations WHERE user_id=$1',[user.id])).rows[0].n,10,'Rejected claim rolled back its empty chat');
  await db.query("UPDATE app.generation_guards SET recent=jsonb_set(recent,ARRAY[$2],to_jsonb(extract(epoch FROM clock_timestamp())-61)) WHERE user_id=$1",[user.id,ids[0]]);
  assert.equal((await start()).state,'created');
  await assert.rejects(start(),limited);
});

test('two running requests across chats; failures release slots and identities cannot release each other',async()=>{
  const a=randomUUID(),b=randomUUID();
  const results=await Promise.allSettled([start(user,a),start(user,b),start()]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,2);
  assert.equal(results.find(result=>result.status==='rejected').reason.retryAfter,5);
  assert.equal(await store.finishConversation(other,a,false,output),false);
  await assert.rejects(start(),limited);
  await store.finishConversation(user,a,false,output);
  assert.equal((await start()).state,'created');
});

test('deleting chats cannot erase rate counts or release a still-running request',async()=>{
  const a=randomUUID(),b=randomUUID();
  const first=await start(user,a), second=await start(user,b);
  await store.removeConversation(user,first.chat_id);await store.removeConversation(user,second.chat_id);
  await assert.rejects(start(),limited);
  assert.equal(await store.finishConversation(user,a,true,output),false);
  assert.equal((await start()).state,'created');
  await db.query("UPDATE app.generation_guards SET active='{}',recent=(SELECT jsonb_object_agg(x::text,extract(epoch FROM clock_timestamp())) FROM generate_series(1,10) x) WHERE user_id=$1",[user.id]);
  await assert.rejects(start(),error=>limited(error)&&error.retryAfter===60);
});

test('crashed requests release expired leases and old starts age out',async()=>{
  await start();await start();
  await db.query("UPDATE app.generation_guards SET active=(SELECT jsonb_object_agg(key,to_jsonb(1)) FROM jsonb_each(active)),recent=(SELECT jsonb_object_agg(key,to_jsonb(1)) FROM jsonb_each(recent)) WHERE user_id=$1",[user.id]);
  assert.equal((await start()).state,'created');
});

test('API rejects abuse before calling AI and provides a retry header',async()=>{
  await start();await start();let called=0;
  const handler=createAIHandler({identity:async()=>user,env:{BILLING_SITE_URL:'https://app.example'},storeFactory:()=>store,generate:async()=>{called++;return output;}});
  const response=await handler(new Request('https://app.example/api/generate',{method:'POST',headers:{origin:'https://app.example','content-type':'application/json'},body:JSON.stringify(input)}));
  assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'5');assert.equal(called,0);
});

test('missing guard migration fails closed instead of falling back to unlimited generation',async()=>{
  let called=0;
  const unavailable=createAccountStore({},async()=>{throw Object.assign(new Error('missing function'),{code:'42883'});});
  const handler=createAIHandler({identity:async()=>user,env:{BILLING_SITE_URL:'https://app.example'},storeFactory:()=>unavailable,generate:async()=>{called++;return output;}});
  const response=await handler(new Request('https://app.example/api/generate',{method:'POST',headers:{origin:'https://app.example','content-type':'application/json'},body:JSON.stringify(input)}));
  assert.equal(response.status,503);assert.equal(called,0);
});
