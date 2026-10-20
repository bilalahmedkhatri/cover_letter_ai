import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWithModel,gatewayQuery} from '../server/ai/providers.mjs';
import {createAIHandler} from '../server/ai/handler.mjs';

const env={NODE_ENV:'development',AI_GATEWAY_QUERY_URL:'https://gateway.example/api/v1/query/',AI_GATEWAY_API_KEY:'test-server-key'};
const input={kind:'cover-letter',name:'Alex',recipient:'',description:'Apply for a developer role using my supplied project.',resumeText:'Built a website.',skills:'JavaScript',experience:'',language:'English',url:'',tone:'Professional',length:'medium'};
const requestId='11111111-1111-4111-8111-111111111111';
const job={operation:'standard',input,requestId};
const result=(answer='A finished letter',finish_reason='stop')=>Response.json({answer,finish_reason,request_id:requestId,sources:[{url:'https://unrequested.example'}]});

test('optional titles preserve localized text and invalid metadata never loses a letter',async()=>{
 for(const title of ['Frontend Developer — Acme','Веб-разработчик — Acme','Développeur web chez Acme','Desarrollador web en Acme','Desenvolvedor web na Acme']){
  const output=await generateWithModel(job,{env,fetchImpl:async()=>Response.json({answer:'Letter',title:'  '+title+'  ',request_id:requestId,finish_reason:'stop'})});
  assert.equal(output.title,title);assert.equal(output.text,'Letter');
 }
 for(const title of [undefined,null,42,{},'', 'x'.repeat(81),'one two three four five six seven eight','Call 03213000022','Email abc@example.com','<b>Developer</b>']){
  const output=await generateWithModel(job,{env,fetchImpl:async()=>Response.json({answer:'Letter',title,request_id:requestId,finish_reason:'stop'})});
  assert.deepEqual(output,{text:'Letter',sources:[]});
 }
 const review=await generateWithModel(job,{env,promptOverride:'Review this letter.',fetchImpl:async()=>Response.json({answer:'Review',title:'Wrong review title',request_id:requestId,finish_reason:'stop'})});
 assert.equal(review.title,undefined);
});

test('cover letter sends only prompt to direct generation with service key and trace ID',async()=>{
 let sent;
 const output=await generateWithModel(job,{env,fetchImpl:async(url,options)=>{sent={url,options};return result();}});
 assert.equal(sent.url,'https://gateway.example/api/v1/generate/');
 assert.deepEqual(JSON.parse(sent.options.body),{prompt:gatewayQuery(job,{env})});
 assert.equal(sent.options.headers['X-API-Key'],env.AI_GATEWAY_API_KEY);
 assert.equal(sent.options.headers['X-Request-ID'],requestId);
 assert.equal(sent.options.cache,'no-store');assert.equal(sent.options.redirect,'error');
 assert.deepEqual(output,{text:'A finished letter',sources:[]});
});

test('all five languages preserve multiline Unicode answers, including unknown finish status',async()=>{
 for(const [language,text] of [['English','Dear team,\n\nMy project.'],['Russian','Уважаемая команда,\n\nМой проект.'],['Spanish','Estimado equipo:\n\nMi colaboración.'],['French','Madame, Monsieur,\n\nMon expérience.'],['Portuguese','Prezada equipe,\n\nMinha experiência.']]){
  const answer='  '+text+'\n';
  const output=await generateWithModel({...job,input:{...input,language}},{env,fetchImpl:async(_url,options)=>{
   assert.match(JSON.parse(options.body).prompt,new RegExp(language));return result(answer,'unknown');
  }});
  assert.equal(output.text,answer);
 }
});

test('new prompt budget accepts full document over old limit and enforces exact code-point boundary',async()=>{
 const large={...job,input:{...input,resumeText:'я'.repeat(6000)}};
 const prompt=gatewayQuery(large,{env});assert.ok(Array.from(prompt).length>4096);
 let calls=0;await generateWithModel(large,{env,fetchImpl:async()=>{calls++;return result();}});assert.equal(calls,1);
 const unicode={...job,input:{...input,resumeText:'😀'.repeat(50)}};
 const count=Array.from(gatewayQuery(unicode,{env})).length;
 assert.doesNotThrow(()=>gatewayQuery(unicode,{env:{...env,AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS:String(count)}}));
 assert.throws(()=>gatewayQuery(unicode,{env:{...env,AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS:String(count-1)}}),e=>e.status===413);
});

test('serialized JSON bytes and malformed Unicode fail before network dispatch',async()=>{
 const bytes=Buffer.byteLength(JSON.stringify({prompt:gatewayQuery(job,{env})}),'utf8');
 for(const [candidate,config,status] of [[job,{...env,AI_GATEWAY_GENERATE_MAX_BODY_BYTES:String(bytes-1)},413],[{...job,input:{...input,resumeText:'\uD800'}},env,422],[job,{...env,AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS:'bad'},503]]){
  let calls=0;await assert.rejects(generateWithModel(candidate,{env:config,fetchImpl:async()=>{calls++;return result();}}),e=>e.status===status);assert.equal(calls,0);
 }
 assert.doesNotThrow(()=>gatewayQuery(job,{env:{...env,AI_GATEWAY_GENERATE_MAX_BODY_BYTES:String(bytes)}}));
});

test('direct endpoint override is honored and unsafe/misderived configuration never dispatches',async()=>{
 await generateWithModel(job,{env:{...env,AI_GATEWAY_GENERATE_URL:'https://direct.example/generate/'},fetchImpl:async url=>{assert.equal(url,'https://direct.example/generate/');return result();}});
 for(const config of [{...env,AI_GATEWAY_GENERATE_URL:'http://remote.example/generate/'},{...env,AI_GATEWAY_GENERATE_URL:'https://user:secret@example.com/'},{...env,AI_GATEWAY_QUERY_URL:'https://gateway.example/custom'},{...env,AI_GATEWAY_API_KEY:''}]){
  let calls=0;await assert.rejects(generateWithModel(job,{env:config,fetchImpl:async()=>{calls++;return result();}}),e=>e.status===503);assert.equal(calls,0);
 }
});

test('backend errors map to safe actionable failures with no retries or raw-body leaks',async()=>{
 for(const [status,code,expected,pattern] of [[401,'',502,/API key/],[403,'',502,/permissions/],[413,'request_too_large',413,/size limit/],[422,'no_eligible_model',422,/available writing model/],[422,'provider_refusal',422,/could not fulfill/],[429,'rate_limited',429,/rate limited/],[502,'output_truncated',502,/incomplete/],[503,'no_provider_key',503,/available provider/],[504,'request_timeout',504,/too long/],[502,'__proto__',502,/could not complete/]]){
  let calls=0;await assert.rejects(generateWithModel(job,{env,fetchImpl:async()=>{calls++;return Response.json({detail:{code,message:'private secret'}},{status});}}),e=>e.status===expected&&pattern.test(e.message)&&!e.message.includes('private secret'));assert.equal(calls,1);
 }
});

test('invalid, refused, truncated and missing finish metadata never become successful drafts',async()=>{
 for(const payload of [{answer:'',request_id:requestId,finish_reason:'stop'},{answer:'[LLM error: private secret]',request_id:requestId,finish_reason:'stop'},{answer:'Partial',request_id:requestId,finish_reason:'length'},{answer:'No',request_id:requestId,finish_reason:'refusal'},{answer:'Text'},{answer:'Text',request_id:'invalid\ntrace',finish_reason:'stop'}]){
  await assert.rejects(generateWithModel(job,{env,fetchImpl:async()=>Response.json(payload)}),e=>e.status===502&&!e.message.includes('private secret'));
 }
});

test('handler forwards persisted request ID and replays completed results without another generation',async()=>{
 let state='created',calls=0;
 const store={startConversation:async()=>({state,chat_id:requestId,message_id:requestId,answer:'Saved letter',answer_sources:[]}),conversation:async()=>({messages:[]}),finishConversation:async()=>true};
 const handler=createAIHandler({identity:async()=>({id:'user'}),env,storeFactory:()=>store,generate:async(candidate,options)=>{
  assert.equal(candidate.requestId,requestId);
  return generateWithModel(candidate,{...options,fetchImpl:async()=>{calls++;return result();}});
 }});
 const request=()=>new Request('https://app.example/api/generate',{method:'POST',headers:{origin:'https://app.example','Content-Type':'application/json','x-generation-id':requestId},body:JSON.stringify(input)});
 assert.equal((await handler(request())).status,200);assert.equal(calls,1);
 state='completed';const replay=await handler(request());assert.equal((await replay.json()).text,'Saved letter');assert.equal(calls,1);
});

test('configured direct preflight limits reject before opening a conversation',async()=>{
 let stores=0,calls=0;
 const handler=createAIHandler({identity:async()=>({id:'user'}),env:{...env,AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS:'10'},storeFactory:()=>{stores++;throw new Error('Must not open history');},generate:async()=>{calls++;}});
 const response=await handler(new Request('https://app.example/api/generate',{method:'POST',headers:{origin:'https://app.example','Content-Type':'application/json'},body:JSON.stringify(input)}));
 assert.equal(response.status,413);assert.equal(stores,0);assert.equal(calls,0);
});

test('direct conversation context preserves the full current prompt within configured budgets',()=>{
 const history=Array.from({length:8},(_,index)=>({role:index%2?'assistant':'user',content:`Earlier ${index} `+'я'.repeat(400)}));
 const original=JSON.stringify(history),base=gatewayQuery(job,{env});
 const config={...env,AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS:String(Array.from(base).length+1200)};
 const composed=gatewayQuery({...job,history},{env:config});
 assert.ok(composed.startsWith(base));assert.match(composed,/Earlier 7/);assert.doesNotMatch(composed,/Earlier 0/);
 assert.ok(Array.from(composed).length<=Number(config.AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS));assert.equal(JSON.stringify(history),original);
});
