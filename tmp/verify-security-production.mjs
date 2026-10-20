import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let sessionRequests=0;
 await page.route('**/api/auth/**',async route=>{
  sessionRequests++;
  await route.fulfill({contentType:'application/json',body:JSON.stringify({session:{id:'mock-session',userId:'mock-user',token:'FAKE_ONLY',expiresAt:new Date(Date.now()+3600000).toISOString()},user:{id:'mock-user',name:'Test',email:'test@example.invalid',emailVerified:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}})});
 });
 const response=await page.goto('http://localhost:3210/en/features?check=keep',{waitUntil:'domcontentloaded'});
 const headers=response.headers();
 assert.equal(headers['x-frame-options'],'DENY');assert.equal(headers['x-content-type-options'],'nosniff');assert.equal(headers['referrer-policy'],'strict-origin');assert.ok(headers['content-security-policy'].includes("frame-ancestors 'none'"));
 await page.getByRole('button',{name:'Open navigation',exact:true}).click();
 await page.getByRole('link',{name:'Account',exact:true}).last().waitFor();
 await page.getByRole('button',{name:'Open navigation',exact:true}).click();
 console.log('PASS real Neon client session-store initialization with intercepted mock session; security headers present');
 const initial=sessionRequests;await page.evaluate(()=>{window.sameDocument=true});
 for(const [language,locale]of[['Français','fr'],['العربية','ar'],['English','en']]){
  await page.locator('button').filter({has:page.locator('svg.lucide-globe')}).click();await page.getByRole('menuitem',{name:language,exact:true}).click();
  await page.waitForURL(`**/${locale}/features?check=keep`);await page.waitForFunction(locale=>document.documentElement.lang===locale,locale);
  assert.equal(await page.evaluate(()=>window.sameDocument),true);
 }
 assert.equal(sessionRequests,initial);assert.deepEqual(errors,[]);
 console.log('PASS secured production navigation: query, RTL/locale, persistent session and zero browser exceptions');
}finally{await browser.close()}
