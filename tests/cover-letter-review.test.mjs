import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWithCoverLetterReview} from '../server/ai/cover-letter-review.mjs';
import {localCoverLetterIssues} from '../services/coverLetterReview.mjs';
import {prepareCoverLetter} from '../services/coverLetter.mjs';

const input={kind:'cover-letter',name:'Alex',description:'Applicant built a portfolio using HTML and CSS. Job asks for Python and team leadership.',language:'English'};
const job={operation:'standard',requestId:'11111111-1111-4111-8111-111111111111',input};
const clean='Dear team,\n\nI built a portfolio using HTML and CSS.\n\nAlex';
const review=issues=>JSON.stringify({checks:{factuality:true,grammar:true,language:true},issues});
const issue=(kind,quote)=>({kind,quote,message:'Please review this wording.',suggestion:'Remove or correct it.',sourceIds:[]});
const output=text=>({text,sources:[]});

test('clean draft receives one AI review, no repair, and never claims verified truth',async()=>{
 const calls=[];
 const result=await generateWithCoverLetterReview(job,{generate:async(candidate,options)=>{calls.push({candidate,options});return output(calls.length===1?clean:review([]));}});
 assert.equal(calls.length,2);assert.equal(calls[1].candidate.requestId,job.requestId+':review');
 assert.match(calls[1].options.promptOverride,/Job requirements.*do not prove applicant qualifications/);
 assert.equal(result.text,clean);assert.equal(result.qualityReview.checks.factuality,'ai_no_issues_reported');
 assert.deepEqual(result.qualityReview.repair,{attempted:false,applied:false});
});

test('local checks flag multilingual placeholders, unsourced percentages and exact repeated paragraphs',()=>{
 const prepared=prepareCoverLetter(input);
 for(const token of ['[Your name]','[Adresse]','[Courriel]','[Телефон]','[Dirección]','[Endereço]'])assert.ok(localCoverLetterIssues(token,prepared).some(issue=>issue.kind==='placeholder'));
 const paragraph='I built a portfolio using HTML and CSS for my personal project.';
 const issues=localCoverLetterIssues(paragraph+'\n\n'+paragraph+'\n\nImproved outcomes by 40%.',prepared);
 assert.ok(issues.some(issue=>issue.kind==='repetition'));assert.ok(issues.some(issue=>issue.kind==='unsupported_number'));
 assert.ok(!localCoverLetterIssues('Improved by 40%.',prepareCoverLetter({...input,experience:'Improved by 40%.'})).some(issue=>issue.kind==='unsupported_number'));
});

test('one anchored repair is applied and semantic checks are reset for the revised wording',async()=>{
 let calls=0;const initial='Dear team,\nI led a Python team.\n[Your name]';
 const result=await generateWithCoverLetterReview(job,{generate:async(_job,options)=>{
  calls++;if(calls===1)return output(initial);if(calls===2)return output(review([issue('unsupported_claim','I led a Python team.')]));
  assert.match(options.promptOverride,/Repair the draft once/);return output(clean);
 }});
 assert.equal(calls,3);assert.equal(result.text,clean);assert.equal(result.qualityReview.repair.applied,true);
 assert.equal(result.qualityReview.checks.grammar,'not_checked');assert.equal(result.qualityReview.checks.factuality,'not_checked');
 assert.equal(result.qualityReview.issues.length,0);assert.ok(result.qualityReview.previousIssues.length>=2);
 assert.ok(result.qualityReview.warnings.includes('revised_text_not_reviewed'));
});

test('unresolved anchored findings survive a partial repair and no second repair is attempted',async()=>{
 let calls=0;const claim='I led a Python team.';
 const result=await generateWithCoverLetterReview(job,{generate:async()=>{
  calls++;return output(calls===1?claim+'\n[Your name]':calls===2?review([issue('unsupported_claim',claim)]):claim+'\nAlex');
 }});
 assert.equal(calls,3);assert.equal(result.qualityReview.checks.factuality,'needs_review');
 assert.ok(result.qualityReview.issues.some(issue=>issue.quote===claim));
});

test('invalid JSON, unanchored quotes and non-existing source IDs become not-checked warnings',async()=>{
 for(const bad of ['plain text',JSON.stringify({checks:{factuality:true,grammar:true,language:true},issues:[issue('grammar','Not present')]}),review([{...issue('grammar','Dear team,'),sourceIds:['resume']}])]){
  let calls=0;const result=await generateWithCoverLetterReview(job,{generate:async()=>output(++calls===1?clean:bad)});
  assert.equal(calls,2);assert.equal(result.text,clean);assert.equal(result.qualityReview.checks.factuality,'not_checked');
  assert.ok(result.qualityReview.warnings.includes('review_unavailable'));
 }
});

test('a failed, unchanged or newly unsafe repair preserves the original draft and findings',async()=>{
 const initial='Dear team,\n[Your name]';
 for(const repair of ['throw',initial,'Dear team,\nImproved sales by 99%.\nAlex']){
  let calls=0;const result=await generateWithCoverLetterReview(job,{generate:async()=>{
   calls++;if(calls===1)return output(initial);if(calls===2)return output(review([]));
   if(repair==='throw')throw new Error('private-provider-secret');return output(repair);
  }});
  assert.equal(calls,3);assert.equal(result.text,initial);assert.equal(result.qualityReview.repair.applied,false);
  assert.ok(result.qualityReview.warnings.includes('repair_unavailable'));assert.ok(!JSON.stringify(result).includes('private-provider-secret'));
 }
});

test('deadline exhaustion skips review and repair rather than starting more model calls',async()=>{
 let time=0,calls=0;
 const result=await generateWithCoverLetterReview(job,{now:()=>time,generate:async()=>{calls++;time=89500;return output('[Your name]');}});
 assert.equal(calls,1);assert.equal(result.qualityReview.repair.attempted,false);
 assert.ok(result.qualityReview.warnings.includes('review_unavailable'));assert.equal(result.qualityReview.checks.structure,'needs_review');
});

test('review context overflow is detected before a second HTTP request without truncation',async()=>{
 let calls=0;const large={...job,input:{...input,resumeText:'x'.repeat(12000)}};
 const result=await generateWithCoverLetterReview(large,{env:{AI_GATEWAY_API_KEY:'mock-key'},fetchImpl:async()=>{
  calls++;return Response.json({answer:'A'.repeat(25000),request_id:job.requestId,finish_reason:'stop'});
 }});
 assert.equal(calls,1);assert.equal(result.text.length,25000);assert.ok(result.qualityReview.warnings.includes('context_limit'));
});

test('review language instructions cover all five languages without promising native verification',async()=>{
 for(const language of ['English','Russian','Spanish','French','Portuguese']){
  let calls=0;await generateWithCoverLetterReview({...job,input:{...input,language}},{generate:async(_job,options)=>{
   calls++;if(calls===1)return output(clean);assert.ok(options.promptOverride.includes(`Report messages in ${language}`));return output(review([]));
  }});assert.equal(calls,2);
 }
});
