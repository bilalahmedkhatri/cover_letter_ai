import {chromium} from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import ts from '../../node_modules/typescript/lib/typescript.js';
import {readFile,mkdir} from 'node:fs/promises';
const source=await readFile('services/exportLetterPdf.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace("import('html2pdf.js')",'Promise.resolve({default:window.html2pdf})').replace('export async function','window.exportLetterPdf = async function');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{const page=await browser.newPage({acceptDownloads:true});await page.setContent('<html><head><style>body{background:oklch(10% 0 0);color:oklch(90% 0 0)}</style></head><body></body></html>');await page.addScriptTag({path:'node_modules/html2pdf.js/dist/html2pdf.bundle.min.js'});await page.addScriptTag({content:js});await mkdir('output/pdf',{recursive:true});
for(const [name,html] of [['export-check','<p>Alex Example<br>alex@example.com</p><p>Dear hiring team,</p>'+Array.from({length:14},(_,i)=>'<p><strong>Paragraph '+(i+1)+'.</strong> '+('I build accessible web applications and work closely with my team. '.repeat(6))+'</p>').join('')+'<p>Sincerely,<br>Alex Example</p>'],['multilingual-check','<p>Dear hiring team,</p><p>Мой опыт работы включает создание веб-приложений.</p><p>Je souhaite rejoindre votre équipe pour contribuer à vos projets.</p><p dir="rtl" style="text-align:right">أرغب في الانضمام إلى فريقكم والعمل على تطوير تطبيقات الويب.</p><p>Sincerely,<br>Alex</p>']]){
 const download=page.waitForEvent('download');await page.evaluate(html=>window.exportLetterPdf(html),html);await(await download).saveAs('output/pdf/'+name+'.pdf');console.log(name+' downloaded');
}
}finally{await browser.close();}
