import assert from 'node:assert/strict';
import { chromium } from 'file:///C:/Users/Bilal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto('http://localhost:3210/en/features?check=preserve', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'A writing workspace for your next opportunity.', exact: true }).waitFor();
  await page.evaluate(() => { window.__documentMarker = 'same-document'; });
  // Wait until the existing session check has started before checking remounts.
  await page.waitForFunction(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('/api/auth/')));
  const initialSessionRequests = requests.filter(url => url.includes('/api/auth/')).length;
  for (const [name, locale, direction] of [['Français', 'fr', 'ltr'], ['العربية', 'ar', 'rtl'], ['English', 'en', 'ltr']]) {
    await page.locator('button').filter({ has: page.locator('svg.lucide-globe') }).click();
    const target = page.getByRole('menuitem', { name, exact: true });
    assert.equal(await target.getAttribute('href'), `/${locale}/features?check=preserve`);
    await target.click();
    await page.waitForURL(`**/${locale}/features?check=preserve`);
    await page.waitForFunction(({ locale, direction }) => document.documentElement.lang === locale && document.documentElement.dir === direction, { locale, direction });
    assert.equal(await page.evaluate(() => window.__documentMarker), 'same-document');
    await page.locator('[data-page-article]').waitFor();
    assert.equal(await page.locator('main').evaluate(node => node.scrollWidth > innerWidth + 2), false);
    console.log(`PASS ${locale}: client navigation, query retained, language/direction and article rendered`);
  }
  assert.equal(requests.filter(url => url.includes('/api/auth/')).length, initialSessionRequests, 'Language changes must not remount the session provider');
  assert.deepEqual(errors, []);
  // Reloaded HTML must already have the requested language, independent of storage.
  for (const locale of ['en', 'ru', 'es', 'fr', 'pt', 'nl', 'ar']) {
    await page.goto(`http://localhost:3210/${locale}`, { waitUntil: 'domcontentloaded' });
    await page.locator('main h1').waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), locale);
    assert.equal(await page.locator('html').getAttribute('dir'), locale === 'ar' ? 'rtl' : 'ltr');
    assert.ok((await page.locator('main h1').textContent()).trim());
  }
  assert.deepEqual(errors, []);
  await page.screenshot({ path: 'output/playwright/locale-loading-ar-mobile.png', fullPage: false });
  console.log('PASS all seven locale landing pages without browser exceptions');
} finally {
  await browser.close();
}
