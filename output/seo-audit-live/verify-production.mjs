import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3004'],{env:{...process.env,NEON_AUTH_BASE_URL:'',NEON_AUTH_COOKIE_SECRET:'',DATABASE_URL:''},stdio:['ignore','pipe','pipe']});
const results=[];
try {
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Start timeout')),25000);child.stdout.on('data',data=>{if(data.toString().includes('Ready')){clearTimeout(timer);resolve();}});child.on('exit',code=>reject(new Error(`Server exited ${code}`)));});
  for(const locale of ['en','ru']){
    const r=await fetch(`http://localhost:3004/${locale}/dashboard`,{redirect:'manual'});
    assert.equal(r.status,307);assert.match(r.headers.get('location'),new RegExp(`/${locale}/login\\?unavailable=1`));results.push(`${locale} dashboard: safe 307`);
  }
  for(const [path,status] of [['/en/login?unavailable=1',200],['/api/account',401],['/api/history',401],['/llms.txt',200],['/robots.txt',200],['/not-a-real-page',404]]){
    const r=await fetch(`http://localhost:3004${path}`);assert.equal(r.status,status,path);results.push(`${path}: ${r.status}`);
  }
  const xml=await (await fetch('http://localhost:3004/sitemap.xml')).text();assert.equal((xml.match(/<loc>/g)||[]).length,34);results.push('sitemap: 34 canonical URLs');
  for(const [path,canonical] of [['/es/features','/en/features'],['/ru/features','/ru/features'],['/ru/privacy','/en/privacy']]){
    const $=load(await(await fetch(`http://localhost:3004${path}`)).text());assert.equal($('link[rel=canonical]').attr('href'),`https://ailettergen.com${canonical}`);assert.match($('meta[property="og:image"]').attr('content'),/opengraph-image/);assert.equal($('meta[name="twitter:card"]').attr('content'),'summary_large_image');results.push(`${path}: canonical and social tags pass`);
  }
  const image=await fetch('http://localhost:3004/opengraph-image');assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/png/);const png=Buffer.from(await image.arrayBuffer());assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);await writeFile('output/seo-audit-live/social-preview.png',png);results.push('social preview: HTTP 200 PNG 1200x630');
  await writeFile('output/seo-audit-live/production-verification.json',JSON.stringify(results,null,2));console.log(results.join('\n'));
}finally{child.kill();}
