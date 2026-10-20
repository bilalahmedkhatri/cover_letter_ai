import {redactAnalyticsEvent} from '../services/analyticsPrivacy.mjs';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser = await chromium.launch({headless:true,channel:'msedge'});
try {
  const page = await browser.newPage();
  const payloads = [];
  page.on('console', message => {
    if (message.text().includes('[view]')) payloads.push(Promise.all(message.args().map(arg => arg.jsonValue().catch(() => null))));
  });
  await page.route('**/*', route => route.fulfill({status:200,contentType:'text/html',body:'<html><head></head><body>Mock reset page</body></html>'}));
  await page.goto('https://app.example/en/login?token=FAKE_TEST_TOKEN_ONLY');
  await page.addScriptTag({content:'window.redactAnalyticsEvent='+redactAnalyticsEvent.toString()});
  await page.evaluate(source => {
    window.vaq=[['beforeSend',window.redactAnalyticsEvent]];
    const script=document.createElement('script');
    script.dataset.disableAutoTrack='1';
    script.textContent=source;
    document.head.append(script);
    window.va('pageview',{route:'/[locale]/login',path:'/en/login'});
  }, await readFile('tmp/vercel-analytics-debug.js','utf8'));
  await page.waitForFunction(() => typeof window.va === 'function');
  // Flush the debug script's asynchronous page-view construction.
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve,200)));
  const logs = await Promise.all(payloads);
  assert.ok(!JSON.stringify(logs).includes('FAKE_TEST_TOKEN_ONLY'));
  assert.ok(JSON.stringify(logs).includes('https://app.example/en/login'));
  assert.ok(page.url().includes('FAKE_TEST_TOKEN_ONLY'));
  console.log('PASS: actual beforeSend helper strips reset token from Vercel pageview payload while leaving the auth URL unchanged; no real tokens or external requests.');
} finally {await browser.close();}
