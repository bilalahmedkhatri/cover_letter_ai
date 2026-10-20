import {chromium} from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const postcss=require('postcss');
const css=await postcss([require('@tailwindcss/postcss')()]).process(await readFile('app/globals.css','utf8'),{from:path.resolve('app/globals.css')});
await mkdir('output/playwright',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
try {
 for(const [locale,label] of [['en','Preparing your draft…'],['ru','Готовим ваш черновик…'],['fr','Préparation de votre brouillon…'],['es','Preparando tu borrador…'],['pt','Preparando seu rascunho…'],['ar','جارٍ إعداد مسودتك…'],['nl','Je concept wordt voorbereid…']]){
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  await page.route('http://localhost:3107/**',route=>route.fulfill({contentType:'text/html',body:'<html class="dark theme-dark"><body><div id="app" style="max-width:768px;margin:auto;padding:16px"></div></body></html>'}));
  await page.goto('http://localhost:3107/mock');
  await page.addStyleTag({content:css.css});
  await page.addScriptTag({content:`window.process={env:{NODE_ENV:'development'}};window.testLocale=${JSON.stringify(locale)};window.fetch=()=>new Promise(resolve=>{window.finishGeneration=resolve});`});
  await page.addScriptTag({path:'tmp/template-ui/bundle.js'});
  await page.getByRole('textbox',{name:'Writing prompt'}).fill('Write a cover letter for a developer role using my supplied portfolio project.');
  await page.getByRole('button',{name:'Generate draft',exact:true}).click();
  const notification=page.getByRole('status').filter({hasText:label});await notification.waitFor();
  if(await notification.count()!==1)throw Error('Duplicate notification');
  for(const width of [1366,390]){
   await page.setViewportSize({width,height:900});const box=await notification.boundingBox();
   if(!box || box.x<0 || box.x+box.width>width || box.y<0 || box.y+box.height>900)throw Error('Notification outside viewport '+locale+' '+width);
   if(locale==='en')await page.screenshot({path:`output/playwright/generation-status-${width}.png`});
  }
  await page.evaluate(()=>window.finishGeneration(Response.json({error:'Mock failure: try again.'},{status:503})));
  await notification.waitFor({state:'detached'});await page.getByRole('dialog').waitFor();
  await page.getByRole('dialog').locator('button[data-slot="button"]').filter({hasText:/^Close$/}).click();
  await page.getByRole('button',{name:'Generate draft',exact:true}).click();await notification.waitFor();
  await page.evaluate(()=>window.finishGeneration(Response.json({text:'A mock letter.',sources:[],historySaved:false})));
  await notification.waitFor({state:'detached'});await page.getByRole('link',{name:'Open draft',exact:true}).waitFor();
  console.log('PASS '+locale+': visible pending state, mobile fit, clears on error/success');await page.close();
 }
} finally {await browser.close();}
