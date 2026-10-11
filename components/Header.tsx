import React, { useEffect, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { resourceLabels } from '../services/resourceCopy';
import { Menu, X, Moon, Sun, PenLine, ChevronDown } from 'lucide-react';
import { useTheme } from '../App';
import { useLocale } from '../contexts/LocaleContext';
import { useRoutePath } from '../contexts/RouteContext';
import { localizedPath } from '../services/routing';
import { interfaceCopy } from '../services/interfaceCopy';
import { pricingLabel } from '../services/pricingCopy';
import { Button } from './ui/button';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const { locale, t } = useLocale();
  const copy = interfaceCopy(locale);
  const { theme, setTheme } = useTheme();
  const pathname = useRoutePath();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const resources = resourceLabels[locale];
  const resourceLinks = (['/guides', '/compare', '/about'] as const).map((page, index) => <a key={page} href={localizedPath(locale, page)} aria-current={pathname.endsWith(page) ? 'page' : undefined} className="rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-card-secondary">{[resources[1], resources[2], t('about')][index]}</a>);
  const links = <>
    <a href={localizedPath(locale, '/dashboard')} aria-current={pathname.endsWith('/dashboard') ? 'page' : undefined}>{t('footerGenerator')}</a>
    <a href={localizedPath(locale, '/features')} aria-current={pathname.endsWith('/features') ? 'page' : undefined}>{resources[0]}</a>
    <a href={localizedPath(locale, '/pricing')} aria-current={pathname.endsWith('/pricing') ? 'page' : undefined}>{pricingLabel[locale]}</a>

  </>;
  return <header className="site-header sticky top-0 z-30 border-b border-border bg-header-bg/95 backdrop-blur-md">
    <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
      <a href={localizedPath(locale, '/')} className="brand" aria-label="AI Letter Generator Homepage">
        <span className="brand-mark"><PenLine size={20} /></span><span>ailettergen<span className="text-accent">.</span></span>
      </a>
      <nav aria-label={copy.menu} className="header-nav hidden items-center gap-6 text-sm xl:flex">{links}<DropdownMenu.Root dir={locale === 'ar' ? 'rtl' : 'ltr'}><DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" className={/\/(guides|compare|about)$/.test(pathname) ? 'text-accent' : 'text-text-secondary'}>{resources[3]}<ChevronDown size={14}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="start" sideOffset={14} className="header-nav z-50 flex min-w-48 flex-col rounded-xl border border-border bg-card p-2 shadow-lg">{resourceLinks.map((link, index) => <DropdownMenu.Item asChild key={index}>{link}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></nav>
      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSelector />
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={t('themeSwitch', { theme: theme === 'light' ? 'dark' : 'light' })}>{theme === 'light' ? <Moon /> : <Sun />}</Button>
        <Button asChild size="sm" className="hidden xl:inline-flex"><a href={localizedPath(locale, '/dashboard')}>{copy.start}</a></Button>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label={copy.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" aria-label={copy.menu} className="header-nav flex flex-col gap-5 border-t border-border bg-header-bg px-6 py-5 xl:hidden">{links}{resourceLinks}<a href={localizedPath(locale, '/privacy')}>{t('privacy')}</a></nav>}
  </header>;
}
