import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config.mjs';
test('all routes reject framing, MIME sniffing and detailed referrer leakage without disabling Next scripts',async()=>{
  const [rule]=await config.headers();
  assert.equal(rule.source,'/:path*');
  const headers=Object.fromEntries(rule.headers.map(({key,value})=>[key,value]));
  assert.equal(headers['X-Frame-Options'],'DENY');
  assert.equal(headers['Referrer-Policy'],'strict-origin');
  assert.equal(headers['X-Content-Type-Options'],'nosniff');
  assert.match(headers['Content-Security-Policy'],/frame-ancestors 'none'/);
  assert.doesNotMatch(headers['Content-Security-Policy'],/unsafe-eval|unsafe-inline|script-src/);
});
