import React, { useEffect, useState } from 'react';
import { Menu, X, Moon, Sun, PenLine } from 'lucide-react';
import { useTheme } from '../App';
import { useLocale } from '../contexts/LocaleContext';
import { useRoutePath } from '../contexts/RouteContext';
import { localizedPath } from '../services/routing';
import { interfaceCopy } from '../services/interfaceCopy';
import { Button } from './ui/button';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const { locale, t } = useLocale();
  const copy = interfaceCopy(locale);
  const { theme, setTheme } = useTheme();
  const pathname = useRoutePath();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const links = <>
    <a href={localizedPath(locale, '/dashboard')} aria-current={pathname.endsWith('/dashboard') ? 'page' : undefined}>{t('footerGenerator')}</a>
    <a href={localizedPath(locale, '/about')} aria-current={pathname.endsWith('/about') ? 'page' : undefined}>{t('about')}</a>
  </>;
  return <header className="site-header sticky top-0 z-30 border-b border-border bg-header-bg/95 backdrop-blur-md">
    <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
      <a href={localizedPath(locale, '/')} className="brand" aria-label="AI Letter Generator Homepage">
        <span className="brand-mark"><PenLine size={20} /></span><span>ailettergen<span className="text-accent">.</span></span>
      </a>
      <nav aria-label={copy.menu} className="header-nav hidden items-center gap-7 text-sm md:flex">{links}</nav>
      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSelector />
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={t('themeSwitch', { theme: theme === 'light' ? 'dark' : 'light' })}>{theme === 'light' ? <Moon /> : <Sun />}</Button>
        <Button asChild size="sm" className="hidden lg:inline-flex"><a href={localizedPath(locale, '/dashboard')}>{copy.start}</a></Button>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={copy.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" aria-label={copy.menu} className="header-nav flex flex-col gap-5 border-t border-border bg-header-bg px-6 py-5 md:hidden">{links}<a href={localizedPath(locale, '/privacy')}>{t('privacy')}</a></nav>}
  </header>;
}
