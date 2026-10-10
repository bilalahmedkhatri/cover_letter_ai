import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLocale, locales } from '../contexts/LocaleContext';
import { useRoutePath } from '../contexts/RouteContext';
import { resolveRoute, localizedPath } from '../services/routing';
import { interfaceCopy } from '../services/interfaceCopy';
import { Button } from './ui/button';
export default function LanguageSelector() {
  const { locale } = useLocale();
  const page = resolveRoute(useRoutePath()).page;
  return <DropdownMenu.Root dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" aria-label={interfaceCopy(locale).language}><Globe /><span className="uppercase">{locale}</span><ChevronDown /></Button></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={10} className="z-50 min-w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl">
      {locales.map(language => <DropdownMenu.Item key={language.code} asChild>
        <a href={localizedPath(language.code, page === '/404' ? '/' : page)} lang={language.code} className="flex cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:bg-card-secondary">
          {language.name}{locale === language.code && <Check size={15} className="text-accent" />}
        </a>
      </DropdownMenu.Item>)}
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
