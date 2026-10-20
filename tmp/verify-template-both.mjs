import {chromium} from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try {
 const page=await browser.newPage();
 await page.setContent('<div id="app"></div>');
 await page.addScriptTag({content:"window.process={env:{NODE_ENV:'development'}};window.testLocale='en'"});
 await page.addScriptTag({path:'tmp/template-both/bundle.js'});
 const input=page.getByRole('textbox',{name:'Writing prompt'});await input.waitFor();
 await input.fill('Preserve my original application details.');
 for(const [locale,title,language,translatedTitle] of [['ru','Первая работа','French','Premier emploi'],['pt','Primeiro emprego','Spanish','Primer empleo'],['es','Primer empleo','Russian','Первая работа'],['fr','Premier emploi','Portuguese','Primeiro emprego'],['en','First job','English','First job']]){
  await page.evaluate(locale=>{window.testLocale=locale;window.dispatchEvent(new Event('test-locale'));},locale);
  await page.getByRole('button',{name:new RegExp(title)}).waitFor();
  await page.getByRole('combobox',{name:'Output language'}).click();
  await page.getByRole('option',{name:language,exact:true}).click();
  await page.getByRole('button',{name:new RegExp(translatedTitle)}).waitFor();
  if(await input.inputValue()!=='Preserve my original application details.')throw Error('Prompt overwritten');
  console.log('PASS '+locale+': page-language templates, dropdown override and existing text preserved');
 }
 // Returning to an earlier page language must not resurrect an older override.
 await page.evaluate(()=>{window.testLocale='ru';window.dispatchEvent(new Event('test-locale'));});
 await page.getByRole('button',{name:/Первая работа/}).waitFor();
 console.log('PASS: return navigation resets old language overrides');
} finally {await browser.close();}
