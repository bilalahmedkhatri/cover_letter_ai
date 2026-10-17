import { z } from 'zod';
import * as XLSX from 'xlsx';
import { createHash, randomUUID } from 'node:crypto';
import { coverLetterLanguages, parseCoverLetterInput, coverLetterPromptVersion } from '../../services/coverLetter.mjs';
import { coverLetterReviewVersion } from '../../services/coverLetterReview.mjs';
import { generateWithCoverLetterReview } from '../../server/ai/cover-letter-review.mjs';
import { generateWithModel } from '../../server/ai/providers.mjs';

export const caseColumns = ['case_id','scenario','language','brief','resume_text','name','recipient','skills','experience','tone','length','custom_instruction','must_include','must_not_claim','review_notes'];
export const resultColumns = ['run_id','created_at','case_id','case_hash','scenario','language','repetition','backend_label','actual_model','prompt_version','review_version','status','duration_ms','generation_calls','review_calls','repair_calls','initial_letter','generated_letter','quality_review','error','factuality_pass','language_pass','placeholders_pass','required_information_pass','grammar_score','relevance_score','naturalness_score','conciseness_score','specificity_score','human_decision','reviewer_notes'];
const rowSchema = z.object(Object.fromEntries(caseColumns.map(key => [key,z.string()]))).strict().extend({
  case_id:z.string().regex(/^[a-z0-9][a-z0-9_-]{0,79}$/),
  scenario:z.string().trim().min(1),language:z.enum(coverLetterLanguages),
  must_include:z.string().trim().min(1),must_not_claim:z.string().trim().min(1),review_notes:z.string().trim().min(1),
});

export function readCases(csv) {
  const book=XLSX.read(csv.replace(/^\uFEFF/u,''),{type:'string',raw:true,FS:',',cellDates:false});
  const rows=XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{header:1,raw:true,defval:'',blankrows:false});
  const [header,...data]=rows;
  if(!header || header.length!==caseColumns.length || new Set(header).size!==header.length || caseColumns.some(key=>!header.includes(key)))throw new Error(`CSV headers must contain exactly: ${caseColumns.join(', ')}`);
  if(!data.length)throw new Error('The dataset has no cases.');
  const ids=new Set();
  return data.map((values,index)=>{
    if(values.length>header.length)throw new Error(`CSV row ${index+2} has extra cells. Quote commas and multiline values.`);
    const parsed=rowSchema.safeParse(Object.fromEntries(header.map((key,i)=>[key,String(values[i]??'')])));
    if(!parsed.success)throw new Error(`CSV row ${index+2}: invalid ${parsed.error.issues[0]?.path.join('.')}.`);
    const row=parsed.data;
    if(ids.has(row.case_id))throw new Error(`Duplicate case_id: ${row.case_id}`);
    ids.add(row.case_id);
    let input;
    try { input=parseCoverLetterInput({kind:'cover-letter',description:row.brief,resumeText:row.resume_text,name:row.name,recipient:row.recipient,skills:row.skills,experience:row.experience,
      language:row.language,tone:row.tone||'Professional',length:row.length||'short',customInstruction:row.custom_instruction}); }
    catch(error){throw new Error(`${row.case_id}: ${error.message}`);}
    return {row,input};
  });
}

// Always quote fields and neutralise spreadsheet formulas in exported free text.
// A leading apostrophe is an export escape, not part of the generated letter.
export function csvLine(values) {
  return values.map(value=>{
    let text=String(value??'');
    if(/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text))text="'"+text;
    return '"'+text.replaceAll('"','""')+'"';
  }).join(',')+'\r\n';
}

export async function evaluateCase(testCase,{runId=randomUUID(),repetition=1,label='unlabelled',generate=generateWithModel,now=Date.now}={}) {
  const calls={generation:0,review:0,repair:0};
  let initial='';
  const start=now();
  const record={run_id:runId,created_at:new Date().toISOString(),case_id:testCase.row.case_id,
    case_hash:createHash('sha256').update(JSON.stringify(testCase.row)).digest('hex'),scenario:testCase.row.scenario,language:testCase.row.language,repetition,
    backend_label:label,actual_model:'unknown',prompt_version:coverLetterPromptVersion,review_version:coverLetterReviewVersion,status:'error',human_decision:'pending'};
  try {
    const result=await generateWithCoverLetterReview({operation:'standard',input:testCase.input,history:[],requestId:randomUUID()},{now,
      generate:async(job,options)=>{
        const stage=job.requestId.endsWith(':review')?'review':job.requestId.endsWith(':repair')?'repair':'generation';
        calls[stage]++;
        const output=await generate(job,options);
        if(stage==='generation')initial=output.text;
        return output;
      }});
    Object.assign(record,{status:'generated',generated_letter:result.text,quality_review:JSON.stringify(result.qualityReview)});
  }catch(error){record.error=`Generation failed${Number.isInteger(error?.status)?` (status ${error.status})`:''}. Check the local gateway configuration and logs.`;}
  return {...record,initial_letter:initial,duration_ms:Math.max(0,now()-start),generation_calls:calls.generation,review_calls:calls.review,repair_calls:calls.repair};
}
