import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render } = await vite.ssrLoadModule('/entry-server.tsx');
  const { localeCodes, publicPages, localizedPath } = await vite.ssrLoadModule('/services/routing.ts');
  const template = await readFile('dist/index.html', 'utf8');
  if (!template.includes('<!--seo-head-->') || !template.includes('<div id="root"></div>')) {
    throw new Error('The HTML template is missing its SEO or React root placeholder.');
  }
  for (const locale of localeCodes) {
    for (const page of publicPages) {
      const route = localizedPath(locale, page);
      const rendered = render(route);
      const html = template
        .replace('<html lang="en">', `<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">`)
        .replace('<!--seo-head-->', rendered.head)
        .replace('<div id="root"></div>', `<div id="root" data-prerendered>${rendered.body}</div>`);
      const directory = path.join('dist', route.slice(1));
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, 'index.html'), html);
    }
  }
  console.log(`Prerendered ${localeCodes.length * publicPages.length} public routes.`);
} finally {
  await vite.close();
}
