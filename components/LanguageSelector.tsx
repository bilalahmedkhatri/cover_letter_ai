import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLocale, locales } from '../contexts/LocaleContext';
import { useRoutePath } from '../contexts/RouteContext';
import { resolveRoute, localizedPath } from '../services/routing';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from './ui/button';
export default function LanguageSelector() {
  const { locale, shell } = useLocale();
  const page = resolveRoute(useRoutePath()).page;
  // Independent DB posts have no translation-group relationship. Switch to
  // the chosen language's blog index instead of inventing an article translation.
  const destination = page.startsWith('/blog/') ? '/blog' : page === '/404' ? '/' : page;
  const query = useSearchParams().toString();
  return <DropdownMenu.Root dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" aria-label={shell.interface.language}><Globe /><span className="uppercase">{locale}</span><ChevronDown /></Button></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={10} className="z-50 min-w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl">
      {locales.map(language => <DropdownMenu.Item key={language.code} asChild>
        <Link prefetch={false} scroll={false} href={localizedPath(language.code, destination) + (query ? `?${query}` : '')} lang={language.code} className="flex cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:bg-card-secondary">
          {language.name}{locale === language.code && <Check size={15} className="text-accent" />}
        </Link>
      </DropdownMenu.Item>)}
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
