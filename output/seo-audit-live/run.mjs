import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile} from 'node:fs/promises';
import {load} from 'cheerio';
const run=promisify(execFile);
const paths=['/en','/ru','/en/pricing','/es/features','/en/blog/job-cover-letter-guide','/robots.txt','/sitemap.xml','/llms.txt','/en/dashboard','/this-page-should-not-exist'];
const results=await Promise.all(paths.map(async path=>{
 const file='output/seo-audit-live/'+(path.slice(1).replaceAll('/','-')||'root')+'.txt';
 try {
 const {stdout}=await run('curl.exe',['-sS','-L','--max-time','25','--resolve','ailettergen.com:443:216.198.79.1','--output',file,'--write-out','%{http_code}|%{url_effective}|%{content_type}','https://ailettergen.com'+path],{maxBuffer:1024*1024});
 const [status,url,type]=stdout.split('|');const text=await readFile(file,'utf8');
 if(!type.includes('html'))return {path,status,url,type,content:text.slice(0,6000)};
 const $=load(text);$('script,style,noscript').remove();
 return {path,status,url,type,title:$('title').text(),description:$('meta[name=description]').attr('content'),robots:$('meta[name=robots]').map((_,el)=>$(el).attr('content')).get(),canonical:$('link[rel=canonical]').attr('href'),alternates:$('link[hreflang]').map((_,el)=>({lang:$(el).attr('hreflang'),url:$(el).attr('href')})).get(),lang:$('html').attr('lang'),h1:$('h1').map((_,el)=>$(el).text()).get(),ogImage:$('meta[property="og:image"]').attr('content'),twitter:$('meta[name="twitter:card"]').attr('content'),mainText:$('main').text().replace(/\s+/g,' ').slice(0,500),length:$('main').text().length,privateLinks:$('a[href*="/dashboard/"]').map((_,el)=>$(el).attr('href')).get()};
 }catch(error){return {path,error:String(error).slice(0,160)};}
}));
await writeFile('output/seo-audit-live/summary.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
