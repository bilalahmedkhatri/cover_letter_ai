import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGeneration,generationPrompt} from '../services/workflow.mjs';
const valid={kind:'cover-letter',tone:'Formal',length:'medium',language:'Russian',name:'Applicant',recipient:'Admissions team',description:'Published requirements',resumeText:'Real experience',skills:'Writing',experience:'A real project',url:''};
test('writing inputs support three workflows, selected recipient and languages',()=>{
 for(const kind of ['cover-letter','university','email']){
  const input=validateGeneration({...valid,kind});const prompt=generationPrompt(input);
  assert.match(prompt,/Russian/);assert.match(prompt,/250–350/);assert.match(prompt,/Admissions team/);assert.match(prompt,/never invent/);assert.match(prompt,/untrusted source data/);
  if(kind==='email')assert.match(prompt,/subject line/);
 }
});
test('oversized, malformed and unsafe writing inputs fail before provider use',()=>{
 for(const change of [{kind:'__proto__'},{tone:'command'},{length:'infinite'},{language:'Fake'},{resumeText:'x'.repeat(12001)},{url:'javascript:alert(1)'},{url:'https://secret:password@example.com'},{description:'',url:''},{name:''},{name:null}])assert.throws(()=>validateGeneration({...valid,...change}));
});
test('a URL or pasted requirements can independently provide the opportunity',()=>{
 assert.equal(validateGeneration({...valid,description:'',url:'https://example.com/jobs/role'}).url,'https://example.com/jobs/role');
 assert.equal(validateGeneration(valid).description,valid.description);
});
