import test from 'node:test';
import assert from 'node:assert/strict';
import {createAIHandler} from '../server/ai/handler.mjs';
import {gatewayQuery,generateWithModel,researchPrompt,researchSystemInstruction} from '../server/ai/providers.mjs';
import {generationPrompt,generationSystemInstruction,validateGeneration} from '../services/workflow.mjs';
const env={NODE_ENV:'development',BILLING_SITE_URL:'https://app.example',AI_GATEWAY_API_KEY:'test-gateway-key'};
const writing={kind:'university',name:'Alex',recipient:'Hiring team',description:'Write an application in Spanish. My experience is web development.',resumeText:'',skills:'',experience:'',language:'Spanish',url:'',tone:'Professional',length:'short'};
const research={url:'https://example.edu/programme',programme:'Computing',questions:'Check entry requirements.',language:'English'};
const request=(input,origin='https://app.example')=>new Request('https://app.example/api/generate',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(input)});
const fakeHistory=()=>({startConversation:async()=>({state:'created',chat_id:'11111111-1111-4111-8111-111111111111',message_id:'22222222-2222-4222-8222-222222222222'}),conversation:async()=>({messages:[]}),finishConversation:async()=>true});
const answer=()=>Response.json({answer:'A finished draft',sources:[{url:'https://example.edu/programme',title:'Programme'},{url:'javascript:alert(1)'},{url:'https://secret:password@example.edu'}],routing:{model_used:'gateway-model'}});
test('authenticated writing and research use one gateway with persisted history and no billing or quota dependency',async()=>{
 for(const researchEndpoint of [false,true]){
  const calls=[];const handler=createAIHandler({research:researchEndpoint,identity:async()=>({id:'real-user'}),env,
   generate:async(job,options)=>{calls.push(job);return generateWithModel(job,{...options,fetchImpl:async()=>answer()});},
   storeFactory:fakeHistory});
  const response=await handler(request(researchEndpoint?research:writing));assert.equal(response.status,200);assert.equal(calls.length,1);assert.equal((await response.json()).text,'A finished draft');
 }
});
test('existing application, email and research templates are passed in full without modifications',()=>{
 for(const kind of ['university','email']){
  const input=validateGeneration({...writing,kind});assert.equal(gatewayQuery({input,operation:'standard'}),generationSystemInstruction+'\n\n'+generationPrompt(input));
 }
 const input={...research,operation:'research',length:'long'};assert.equal(gatewayQuery({input,operation:'research'}),researchSystemInstruction+'\n\n'+researchPrompt(input)+'\nSource URL: '+input.url);
});
test('gateway sends the configured server key, correct contract and maps answer and safe sources',async()=>{
 let sent;const output=await generateWithModel({operation:'standard',input:writing},{env,fetchImpl:async(url,options)=>{sent={url,options};return answer();}});
 assert.equal(sent.url,'http://localhost:8000/api/v1/query/');assert.equal(sent.options.headers['X-API-Key'],env.AI_GATEWAY_API_KEY);assert.equal(sent.options.headers['Cache-Control'],'no-cache');assert.equal(sent.options.redirect,'error');assert.equal(sent.options.cache,'no-store');assert.equal(sent.options.method,'POST');
 const payload=JSON.parse(sent.options.body);assert.equal(payload.input_type,'text');assert.equal(payload.search_engine,'auto');assert.equal(payload.query,gatewayQuery({operation:'standard',input:writing}));assert.equal(output.sources.length,1);assert.equal(output.sources[0].type,'search');assert.ok(!JSON.stringify(output).includes(env.AI_GATEWAY_API_KEY));
});
test('gateway output never echoes provider diagnostics, secrets, empty answers or malformed JSON',async()=>{
 for(const response of [new Response('upstream secret',{headers:{'Content-Type':'text/html'}}),Response.json({answer:''}),Response.json({answer:'[LLM error: upstream secret]'}),Response.json({answer:null})]){
  await assert.rejects(generateWithModel({operation:'standard',input:writing},{env,fetchImpl:async()=>response}),e=>e.status===502&&!e.message.includes('upstream secret'));
 }
});
test('oversized full prompts are rejected without truncating templates or sending a request',async()=>{
 let calls=0;await assert.rejects(generateWithModel({operation:'standard',input:{...writing,resumeText:'x'.repeat(4096)}},{env,fetchImpl:async()=>{calls++;return answer();}}),e=>e.status===413&&/nothing has been sent or truncated/.test(e.message));assert.equal(calls,0);
});
test('text-only gateway rejects images explicitly rather than dropping attachments',async()=>{
 let calls=0;await assert.rejects(generateWithModel({operation:'standard',input:{...writing,images:[{mimeType:'image/jpeg',data:'/9j/2Q=='}]}},{env,fetchImpl:async()=>{calls++;return answer();}}),e=>e.status===422&&/Remove images/.test(e.message));assert.equal(calls,0);
});
test('upstream authentication, validation, capacity and internal errors produce safe actionable errors with no retries',async()=>{
 for(const [status,expected] of [[401,502],[403,502],[422,502],[429,429],[500,502],[503,502]]){
  let calls=0;await assert.rejects(generateWithModel({operation:'standard',input:writing},{env,fetchImpl:async()=>{calls++;return new Response('upstream secret',{status});}}),e=>e.status===expected&&!e.message.includes('upstream secret'));assert.equal(calls,1);
 }
});
test('connection failures and timeouts are distinguishable and never leak network details',async()=>{
 for(const [error,pattern] of [[new TypeError('private network secret'),/Cannot connect/],[new DOMException('secret','TimeoutError'),/took too long/]])await assert.rejects(generateWithModel({operation:'standard',input:writing},{env,fetchImpl:async()=>{throw error;}}),e=>e.status===503&&pattern.test(e.message)&&!e.message.includes('secret'));
});
test('missing gateway configuration and unsafe remote HTTP URLs fail before network access',async()=>{
 for(const config of [{},{...env,AI_GATEWAY_QUERY_URL:'http://remote.example/query/'},{...env,AI_GATEWAY_QUERY_URL:'https://user:password@example.com/query/'}]){
  let calls=0;await assert.rejects(generateWithModel({operation:'standard',input:writing},{env:config,fetchImpl:async()=>{calls++;return answer();}}));assert.equal(calls,0);
 }
});
test('sign-in, same-origin and input validation remain enforced without subscription restrictions',async()=>{
 const handler=(identity)=>createAIHandler({identity:async()=>identity,env,generate:async()=>{throw new Error('Must not generate');}});
 assert.equal((await handler(null)(request(writing))).status,401);assert.equal((await handler({id:'user'})(request(writing,'https://evil.example'))).status,403);
 for(const input of [{...writing,kind:'__proto__'},{...writing,language:'Fake'},{...writing,url:'javascript:alert(1)'}])assert.equal((await handler({id:'user'})(request(input))).status,400);
});
test('premium and research no longer need paid access and failures do not contact billing',async()=>{
 for(const [input,isResearch] of [[{...writing,operation:'premium'},false],[research,true]]){
  const handler=createAIHandler({research:isResearch,identity:async()=>({id:'free-user'}),env,generate:async()=>({text:'Result',sources:[]}),storeFactory:fakeHistory});assert.equal((await handler(request(input))).status,200);
 }
});

test('conversation context is bounded without altering the current prompt or mutating history',()=>{
 const history=Array.from({length:8},(_,index)=>({role:index%2?'assistant':'user',content:'Earlier '+index+' '+ 'x'.repeat(300)}));
 const before=JSON.stringify(history);const query=gatewayQuery({operation:'standard',input:writing,history});assert.ok(query.startsWith(generationSystemInstruction+'\n\n'+generationPrompt(writing)));assert.ok(Array.from(query).length<=4096);assert.match(query,/Earlier 7/);assert.equal(JSON.stringify(history),before);
});
