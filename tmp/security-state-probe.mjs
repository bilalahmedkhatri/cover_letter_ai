import assert from 'node:assert/strict';
import { chromium } from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser = await chromium.launch({headless:true,channel:'msedge'});
try {
  const page = await browser.newPage();
  await page.setContent('<div id="app"></div>');
  await page.addScriptTag({path:'tmp/security-state-probe/bundle.js'});
  await page.locator('#owner').filter({hasText:'alice'}).waitFor();
  await page.getByRole('button',{name:'Seed Alice'}).click();
  await page.getByRole('button',{name:'Switch session'}).click();
  await page.locator('#owner').filter({hasText:'bob'}).waitFor();
  assert.equal(await page.locator('#brief').textContent(),'Alice private brief');
  assert.equal(await page.locator('#draft').textContent(),'Alice private letter');
  console.log('REPRODUCED: after refresh changes identity from Alice to Bob, the actual root providers retain Alice brief and letter. Mock identity; no backend/account access used.');
} finally {await browser.close();}
