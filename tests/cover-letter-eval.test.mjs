import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readCases, caseColumns, resultColumns, csvLine, evaluateCase } from '../evals/cover-letter/dataset.mjs';
import { coverLetterLanguages } from '../services/coverLetter.mjs';

const csv=await readFile(new URL('../evals/cover-letter/cases.csv',import.meta.url),'utf8');
const fixtures=readCases(csv);
const serialize=rows=>csvLine(caseColumns)+rows.map(row=>csvLine(caseColumns.map(key=>row[key]))).join('');

test('50 fictional cases cover every scenario in five languages and use production Zod defaults',()=>{
  assert.equal(fixtures.length,50);
  assert.equal(new Set(fixtures.map(test=>test.row.case_id)).size,50);
  const scenarios=new Set(fixtures.map(test=>test.row.scenario));
  assert.equal(scenarios.size,10);
  for(const scenario of scenarios)assert.deepEqual(fixtures.filter(test=>test.row.scenario===scenario).map(test=>test.input.language),coverLetterLanguages);
  assert.ok(fixtures.every(test=>test.input.kind==='cover-letter' && test.input.images.length===0));
  const row={...fixtures[0].row,tone:'',length:''};
  assert.equal(readCases(serialize([row]))[0].input.length,'short');
});

test('CSV round trip preserves UTF-8 accents, Russian, commas, quotes, multiline documents and literal dates',()=>{
  const row={...fixtures[0].row,brief:'Кандидат Évora, "Alex"\nFrench: français. Portuguese: ação. Spanish: español.',resume_text:'2025-01-02\nTest, "quoted"\nSecond line'};
  assert.deepEqual(readCases('\uFEFF'+serialize([row]))[0].row,row);
});

test('invalid headers, duplicate IDs, bad settings and oversized input fail before generation',()=>{
  const row=fixtures[0].row;
  assert.throws(()=>readCases('case_id,brief\na,test'),/headers/);
  assert.throws(()=>readCases(csvLine(caseColumns)),/no cases/);
  assert.throws(()=>readCases(serialize([row,row])),/Duplicate/);
  for(const changes of [{language:'German'},{brief:'x'.repeat(6001)},{tone:'casual'},{brief:'',resume_text:''},{case_id:'../../unsafe'},{must_not_claim:''}])assert.throws(()=>readCases(serialize([{...row,...changes}])));
});

test('result CSV quotes newlines and neutralises spreadsheet formula prefixes',()=>{
  assert.equal(csvLine(['=HYPERLINK("x")',' +1','@SUM(A1)','-2','\tbad','normal, "text"\nnext']), '"\'=HYPERLINK(""x"")","\' +1","\'@SUM(A1)","\'-2","\'\tbad","normal, ""text""\nnext"\r\n');
});

test('runner uses real review pipeline, separates expectations and leaves human/model identity unassessed',async()=>{
  const calls=[];
  const result=await evaluateCase(fixtures[0],{runId:'test-run',label:'config-a',generate:async(job,options)=>{
    calls.push({job,options});
    return {text:options.promptOverride?JSON.stringify({checks:{factuality:true,grammar:true,language:true},issues:[]}):'Dear Hiring Manager,\nI built an HTML and CSS portfolio.',sources:[]};
  }});
  assert.equal(calls.length,2);
  assert.equal(calls[0].job.history.length,0);
  assert.equal(calls[0].job.input.must_not_claim,undefined);
  assert.equal(result.status,'generated');
  assert.equal(result.actual_model,'unknown');
  assert.equal(result.human_decision,'pending');
  assert.equal(result.grammar_score,undefined);
  assert.equal(result.generated_letter,result.initial_letter);
  assert.equal(result.generation_calls,1);assert.equal(result.review_calls,1);assert.equal(result.repair_calls,0);
  assert.match(result.case_hash,/^[a-f0-9]{64}$/);
  assert.equal(JSON.parse(result.quality_review).checks.grammar,'ai_no_issues_reported');
  assert.ok(resultColumns.includes('reviewer_notes'));
});

test('one repair is captured with initial/final wording, and review outages never manufacture passes',async()=>{
  const result=await evaluateCase(fixtures[0],{generate:async(job,options)=>{
    if(job.requestId.endsWith(':review'))return {text:JSON.stringify({checks:{factuality:true,grammar:true,language:true},issues:[{kind:'unsupported_claim',quote:'I led a team.',message:'Unsupported leadership.',suggestion:'Remove.',sourceIds:['brief']}]})};
    return {text:options.promptOverride?'I built a portfolio.':'I led a team.'};
  }});
  assert.equal(result.initial_letter,'I led a team.');assert.equal(result.generated_letter,'I built a portfolio.');
  assert.equal(result.repair_calls,1);
  assert.equal(JSON.parse(result.quality_review).checks.factuality,'not_checked');
  const unavailable=await evaluateCase(fixtures[0],{generate:async(job,options)=>{
    if(options.promptOverride)throw new Error('SECRET');
    return {text:'I built a portfolio.'};
  }});
  assert.equal(unavailable.status,'generated');
  assert.deepEqual(JSON.parse(unavailable.quality_review).warnings,['review_unavailable']);
  assert.equal(unavailable.human_decision,'pending');
  const failure=await evaluateCase(fixtures[0],{generate:async()=>{throw new Error('SECRET');}});
  assert.equal(failure.status,'error');assert.equal(failure.generation_calls,1);
  assert.ok(!JSON.stringify(failure).includes('SECRET'));
});

test('CLI defaults to offline validation and rejects invalid filters/options',()=>{
  const script=new URL('../scripts/eval-cover-letter.mjs',import.meta.url);
  const run=args=>spawnSync(process.execPath,[fileURLToPath(script),...args],{encoding:'utf8'});
  const valid=run(['--language','French','--limit','2','--repeat','3']);
  assert.equal(valid.status,0,valid.stderr);
  assert.match(valid.stdout,/Selected 2 × 3/);
  assert.match(valid.stdout,/no model calls/);
  for(const args of [['--case','missing'],['--repeat','0'],['--language','German'],['--typo']])assert.equal(run(args).status,1);
});
