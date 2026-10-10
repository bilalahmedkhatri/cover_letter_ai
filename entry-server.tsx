import React from 'react';
import { renderToString } from 'react-dom/server';
import App, { generateThemeCss } from './App';
import { themes } from './theme';
import { metadataHtml } from './services/seo';
import { resolveRoute } from './services/routing';
export function render(pathname: string) {
  const { locale, page } = resolveRoute(pathname);
  return { body: renderToString(<App pathname={pathname} />), head: metadataHtml(locale, page) + `<style id="app-theme-styles">${generateThemeCss(themes)}</style>`, locale };
}
