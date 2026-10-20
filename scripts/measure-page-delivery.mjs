// Compare production-mode initial HTML and script delivery under identical conditions.
// Run with a local Next production server: node scripts/measure-page-delivery.mjs URL output.json
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { load } from 'cheerio';

const origin = process.argv[2] || 'http://localhost:3210';
const output = process.argv[3];
if (!output) throw new Error('Provide an output JSON path.');
const paths = ['/en', '/fr', '/ru', '/ar', '/fr/features', '/en/guides', '/en/privacy', '/en/blog', '/fr/blog/write-a-tailored-cover-letter'];
const scripts = new Map();
const report = [];
for (const path of paths) {
  const response = await fetch(new URL(path, origin));
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const html = await response.text();
  const $ = load(html);
  const urls = [...new Set($('script[src]').map((_, node) => $(node).attr('src')).get())];
  const sizes = await Promise.all(urls.map(async url => {
    if (!scripts.has(url)) scripts.set(url, fetch(new URL(url, origin)).then(async response => {
      if (!response.ok) throw new Error(`Script ${url}: HTTP ${response.status}`);
      const source = await response.text();
      return { bytes: Buffer.byteLength(source), gzipBytes: gzipSync(source).length };
    }));
    return scripts.get(url);
  }));
  $('script,style').remove();
  const mainText = ($('main').length ? $('main').text() : $('body').text()).replace(/\s+/g, ' ').trim();
  report.push({ path, lang: $('html').attr('lang'), dir: $('html').attr('dir'), heading: $('h1').first().text(), mainTextHash: createHash('sha256').update(mainText).digest('hex'), mainTextLength: mainText.length, htmlBytes: Buffer.byteLength(html), htmlGzipBytes: gzipSync(html).length, scriptCount: urls.length, scriptBytes: sizes.reduce((n, item) => n + item.bytes, 0), scriptGzipBytes: sizes.reduce((n, item) => n + item.gzipBytes, 0) });
}
await writeFile(output, JSON.stringify({ note: 'Initial HTML script tags only; gzip estimates, not browser timings or complete lazy dependency graphs.', routes: report }, null, 2) + '\n');
console.log(`Measured ${report.length} routes -> ${output}`);
