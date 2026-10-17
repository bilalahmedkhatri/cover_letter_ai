import { readFile, mkdir, writeFile, appendFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { config } from 'dotenv';
import { readCases, resultColumns, csvLine, evaluateCase } from '../evals/cover-letter/dataset.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
try {
  const {values}=parseArgs({options:{live:{type:'boolean'},cases:{type:'string'},case:{type:'string'},language:{type:'string'},limit:{type:'string'},repeat:{type:'string'},label:{type:'string'},output:{type:'string'}}});
  const positive=(key,fallback)=>{
    const n=Number(values[key]??fallback);
    if(!Number.isSafeInteger(n)||n<1||n>1000)throw new Error(`--${key} must be an integer from 1 to 1000.`);
    return n;
  };
  let cases=readCases(await readFile(resolve(root,values.cases||'evals/cover-letter/cases.csv'),'utf8'));
  const total=cases.length;
  if(values.case)cases=cases.filter(test=>test.row.case_id===values.case);
  if(values.language)cases=cases.filter(test=>test.row.language===values.language);
  if(values.limit)cases=cases.slice(0,positive('limit',1));
  const repetitions=positive('repeat',1);
  if(!cases.length)throw new Error('No cases match the selected filters.');
  console.log(`Validated ${total} cases. Selected ${cases.length} × ${repetitions} repetitions; up to ${cases.length*repetitions*3} gateway requests (backend fallbacks may add calls).`);
  if(!values.live)console.log('Validation only: no model calls. Add --live to generate results.');
  else {
    // Operator-only offline evaluation. No app user identity, quota, billing or history writes.
    config({path:resolve(root,'.env.local'),quiet:true});
    if(!process.env.AI_GATEWAY_API_KEY?.trim())throw new Error('AI_GATEWAY_API_KEY is required for --live.');
    const runId=randomUUID();
    const output=resolve(root,values.output||`evals/cover-letter/results/${new Date().toISOString().replaceAll(':','-')}-${runId}.csv`);
    if(!output.endsWith('.csv'))throw new Error('--output must be a .csv file.');
    if(output===resolve(root,values.cases||'evals/cover-letter/cases.csv'))throw new Error('Results must not overwrite the dataset.');
    await mkdir(dirname(output),{recursive:true});
    await writeFile(output,'\uFEFF'+csvLine(resultColumns),{encoding:'utf8',flag:'wx'});
    let failures=0;
    for(const test of cases)for(let repetition=1;repetition<=repetitions;repetition++){
      const record=await evaluateCase(test,{runId,repetition,label:values.label});
      await appendFile(output,csvLine(resultColumns.map(key=>record[key])),'utf8');
      if(record.status==='error')failures++;
      console.log(`${test.row.case_id} [${repetition}/${repetitions}]: ${record.status}; ${record.duration_ms} ms`);
    }
    console.log(`Results: ${output}. Human scores are blank; generated is not a quality pass.`);
    if(failures)process.exitCode=1;
  }
}catch(error){console.error(error.message);process.exitCode=1;}
