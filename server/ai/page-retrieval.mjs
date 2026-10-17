import { BlockList, isIP } from 'node:net';
import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { load } from 'cheerio';
import { PaymentError } from '../payments/nowpayments.mjs';

const denied4 = new BlockList();
for (const [network, prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.88.99.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]]) denied4.addSubnet(network,prefix);
const global6 = new BlockList(); global6.addSubnet('2000::',3,'ipv6');
const denied6 = new BlockList();
for (const [network,prefix] of [['2001::',23],['2001:db8::',32],['2002::',16],['3fff::',20]]) denied6.addSubnet(network,prefix,'ipv6');
export function isPublicIP(address) {
  return isIP(address) === 4 ? !denied4.check(address,'ipv4') : isIP(address) === 6 && global6.check(address,'ipv6') && !denied6.check(address,'ipv6');
}
export function publicPageURL(value) {
  let url;
  try { url = new URL(value); } catch { throw new PaymentError('Enter a valid public website URL.',422); }
  const host = url.hostname.replace(/^\[|\]$/g,'');
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80','443'].includes(url.port)) || (isIP(host) && !isPublicIP(host)))
    throw new PaymentError('Use a public HTTP or HTTPS page without credentials or custom ports.',422);
  url.hash = ''; return url;
}
function requestPage(url, addresses, signal) {
  return new Promise((resolve,reject) => {
    const request = (url.protocol === 'https:' ? https : http).get(url, {
      agent: false, signal,
      headers: { 'User-Agent':'AILetterGen/1.0 (+https://ailettergen.com)', Accept:'text/html,text/plain', 'Accept-Encoding':'identity' },
      // Pin the public DNS result to the actual socket; never resolve again.
      lookup: (_host, options, callback) => options.all ? callback(null,addresses) : callback(null,addresses[0].address,addresses[0].family),
    }, response => {
      const headers = response.headers;
      if (response.statusCode !== 200) { response.destroy(); resolve({status:response.statusCode,headers,text:''}); return; }
      if (!/^text\/(html|plain)\b/i.test(headers['content-type'] || '') || (headers['content-encoding'] && headers['content-encoding'] !== 'identity')) {
        response.destroy(); reject(new PaymentError('This URL is not a readable HTML or text page. Paste its details or upload a document.',422)); return;
      }
      let size = 0; const chunks = [];
      response.on('data', chunk => {
        size += chunk.length;
        if (size > 524288) { response.destroy(new PaymentError('This page is too large. Paste the relevant details instead.',422)); return; }
        chunks.push(chunk);
      });
      response.on('error',reject);
      response.on('end',()=>{
        try {
          const charset = headers['content-type']?.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1] || 'utf-8';
          resolve({status:200,headers,text:new TextDecoder(charset).decode(Buffer.concat(chunks))});
        } catch { reject(new PaymentError('Unable to decode this page. Paste its important details instead.',422)); }
      });
    });
    request.on('error',reject);
  });
}
async function resolvePublic(host, resolveDNS, signal) {
  const addresses = isIP(host) ? [{address:host,family:isIP(host)}] : await Promise.race([
    resolveDNS(host,{all:true,verbatim:true}),
    new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true})),
  ]);
  if (!addresses.length || addresses.some(item => !isPublicIP(item.address))) throw new PaymentError('This URL does not resolve to a public website.',422);
  return addresses;
}
export async function retrievePage(value, {resolveDNS=lookup, download=requestPage}={}) {
  let url = publicPageURL(value);
  const signal = AbortSignal.timeout(10000);
  try {
    for (let redirects=0;redirects<=3;redirects++) {
      signal.throwIfAborted();
      const addresses = await resolvePublic(url.hostname.replace(/^\[|\]$/g,''),resolveDNS,signal);
      const response = await download(url,addresses,signal);
      if ([301,302,303,307,308].includes(response.status) && response.headers.location) {
        url = publicPageURL(new URL(response.headers.location,url).href); continue;
      }
      if (response.status !== 200) throw new PaymentError('This page cannot be read publicly. Paste the relevant details instead.',422);
      let title = url.hostname; let text = response.text;
      if (/html/i.test(response.headers['content-type'] || '')) {
        const $ = load(text); title = $('title').first().text().trim().slice(0,200) || title;
        $('script,style,noscript,iframe,nav,header,footer,form,svg,[hidden],[aria-hidden="true"]').remove();
        const root = $('main').first().length ? $('main').first() : $('article').first().length ? $('article').first() : $('body');
        root.find('p,li,h1,h2,h3,tr,br').append('\n'); text = root.text();
      }
      text = text.replace(/[\t ]+/g,' ').replace(/\n\s*\n+/g,'\n\n').trim();
      if (text.length < 80) throw new PaymentError('This page has too little readable content. Paste its details, especially for pages that require JavaScript or sign-in.',422);
      return {url:url.href,title,text:text.slice(0,16000),truncated:text.length>16000,retrievedAt:new Date().toISOString()};
    }
    throw new PaymentError('This page redirects too many times. Use the final public URL.',422);
  } catch (error) {
    if (error instanceof PaymentError) throw error;
    throw new PaymentError('Unable to retrieve this page. Paste its important details instead.',422);
  }
}
