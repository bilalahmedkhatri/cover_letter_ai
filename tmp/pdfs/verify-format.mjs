import {chromium} from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile,mkdir} from 'node:fs/promises';
import {textDocument} from '../../services/letterDocument.ts';
const text=JSON.parse(await readFile('tmp/pdfs/input.json','utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const html=textDocument(text).content.map(p=>'<p>'+p.content.map(n=>n.type==='hardBreak'?'<br>':escape(n.text)).join('')+'</p>').join('');
const source=await readFile('components/generator/RichEditor.tsx','utf8');const css=source.match(/<style>(.*?)<\/style>/)[1];
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{const page=await browser.newPage();await page.setContent('<html><head><style>'+css+'</style></head><body>'+html+'</body></html>');await page.emulateMedia({media:'print'});await page.pdf({path:'tmp/pdfs/format-check.pdf',preferCSSPageSize:true,displayHeaderFooter:false});}finally{await browser.close();}


