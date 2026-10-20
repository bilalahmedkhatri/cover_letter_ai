"use client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Locale } from '@/types';
import type { LocaleData } from '@/services/locale-data';
export default function AppProviders({
  children, locale, localeData,
}: {
  children: React.ReactNode; locale: Locale; localeData: LocaleData;
}) {
  return (
    <ThemeProvider>
      <LocaleProvider locale={locale} data={localeData}>
        <TooltipProvider>{children}</TooltipProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
