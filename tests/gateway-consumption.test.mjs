import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createAIHandler} from '../server/ai/handler.mjs';

const requestId='33333333-3333-4333-8333-333333333333';
const input={kind:'cover-letter',name:'Alex',recipient:'',description:'Write in Spanish using only my supplied experience.',resumeText:'Built a website.',skills:'JavaScript',experience:'',language:'Spanish',url:'',tone:'Professional',length:'short'};

async function gateway(t,status=200) {
  const requests=[];
  const server=createServer(async(req,res)=>{
    let raw=''; for await(const part of req) raw+=part;
    const payload=JSON.parse(raw);
    requests.push({path:req.url,headers:req.headers,payload});
    res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});
    res.end(JSON.stringify(status===200
      ? {answer:payload.prompt?.startsWith('cover-letter-review.v1') ? JSON.stringify({checks:{factuality:true,grammar:true,language:true},issues:[]}) : 'Estimado equipo:\n\nMi experiencia.',finish_reason:'stop',request_id:requestId,sources:[]}
      : {detail:{code:'no_provider_key',message:'private provider detail'}}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
  const base=`http://127.0.0.1:${server.address().port}/api/v1`;
  return {requests,env:{NODE_ENV:'development',AI_GATEWAY_API_KEY:'isolated-server-key',AI_GATEWAY_QUERY_URL:base+'/query/',AI_GATEWAY_GENERATE_URL:base+'/generate/'}};
}

function fixture(env) {
  const settlements=[];
  const handler=createAIHandler({identity:async()=>({id:'isolated-user'}),env,storeFactory:()=>({
    startConversation:async()=>({state:'created',chat_id:requestId,message_id:requestId}),
    conversation:async()=>({messages:[]}),
    finishConversation:async(_user,_id,success,result)=>{settlements.push({success,result});return true;},
  })});
  const submit=kind=>handler(new Request('http://localhost:13000/api/generate',{
    method:'POST',headers:{origin:'http://localhost:13000','Content-Type':'application/json','x-generation-id':requestId},
    body:JSON.stringify({...input,kind}),
  }));
  return {submit,settlements};
}

test('writing handler uses native fetch for both gateway contracts and saves the mapped answer',async t=>{
  const {env,requests}=await gateway(t);
  const {submit,settlements}=fixture(env);
  for(const kind of ['cover-letter','university']) {
    const response=await submit(kind);
    assert.equal(response.status,200);
    const data=await response.json();
    assert.equal(data.text,'Estimado equipo:\n\nMi experiencia.');
    assert.equal(data.historySaved,true);
    assert.ok(!JSON.stringify(data).includes(env.AI_GATEWAY_API_KEY));
  }
  assert.deepEqual(requests.map(r=>r.path),['/api/v1/generate/','/api/v1/generate/','/api/v1/query/']);
  for(const request of requests) {
    assert.equal(request.headers['x-api-key'],env.AI_GATEWAY_API_KEY);
    assert.equal(request.headers['x-request-id'],request.payload.prompt?.startsWith('cover-letter-review.v1') ? requestId+':review' : requestId);
    assert.equal(request.headers['x-cron-secret'],undefined);
    assert.match(request.payload.prompt || request.payload.query,/Spanish/);
  }
  assert.deepEqual(Object.keys(requests[0].payload),['prompt']);
  assert.equal(requests[2].payload.input_type,'text');
  assert.equal(requests[2].payload.search_engine,'auto');
  assert.ok(settlements.every(entry=>entry.success));
});

test('failed HTTP gateway calls save failure once without retries or private error leakage',async t=>{
  const {env,requests}=await gateway(t,503);
  const {submit,settlements}=fixture(env);
  const response=await submit('cover-letter');
  assert.equal(response.status,503);
  const data=await response.json();
  assert.match(data.error,/no available provider/);
  assert.ok(!JSON.stringify(data).includes('private provider detail'));
  assert.ok(!JSON.stringify(data).includes(env.AI_GATEWAY_API_KEY));
  assert.equal(requests.length,1);
  assert.equal(settlements.length,1);
  assert.equal(settlements[0].success,false);
});
