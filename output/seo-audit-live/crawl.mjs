import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile} from 'node:fs/promises';
import {load} from 'cheerio';
const run=promisify(execFile);
const xml=await readFile('output/seo-audit-live/sitemap.xml.txt','utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
const results=[];let index=0;
async function check(url){try{
 const {stdout}=await run('curl.exe',['-sS','-L','--max-time','25','--resolve','ailettergen.com:443:216.198.79.1','--write-out','\nAUDIT_STATUS:%{http_code}',url],{maxBuffer:3*1024*1024});
 const status=stdout.split('\nAUDIT_STATUS:').pop();const $=load(stdout);const canonical=$('link[rel=canonical]').attr('href');const schemas=$('script[type="application/ld+json"]').length;
 $('script,style,noscript').remove();return {url,status,canonical,title:$('title').text(),h1:$('h1').length,robots:$('meta[name=robots]').map((_,e)=>$(e).attr('content')).get(),schemas,mainCharacters:$('main').text().length,privateLinks:$('a[href*="/dashboard/"]').map((_,e)=>$(e).attr('href')).get()};
 }catch(error){return {url,error:String(error).slice(0,100)};}}
await Promise.all(Array.from({length:5},async()=>{while(index<urls.length){const url=urls[index++];results.push(await check(url));}}));
await writeFile('output/seo-audit-live/crawl.json',JSON.stringify(results,null,2));
const group=new Map();for(const r of results){const key=r.canonical;group.set(key,[...(group.get(key)||[]),r.url]);}
console.log(JSON.stringify({sitemapURLs:urls.length,uniqueURLs:new Set(urls).size,privateURLs:urls.filter(u=>/\/(dashboard|login|account)(\/|$)/.test(new URL(u).pathname)),badResponses:results.filter(r=>r.status!=='200'),canonicalMismatch:results.filter(r=>r.canonical!==r.url),h1Issues:results.filter(r=>r.h1!==1).map(r=>({url:r.url,h1:r.h1})),noindexURLs:results.filter(r=>r.robots?.some(v=>v.includes('noindex'))),jsonLdPages:results.filter(r=>r.schemas>0).length,duplicateCanonicals:[...group].filter(([key,values])=>key&&values.length>1),blog:results.filter(r=>r.url.includes('/blog/'))},null,2));
