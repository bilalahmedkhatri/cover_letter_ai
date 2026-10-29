import Link from "next/link";
import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { useAccount } from "../contexts/AccountContext";
import { useTheme } from "../contexts/ThemeContext";
import Brand from "./Brand";
import { useLocale } from "../contexts/LocaleContext";
import { useRoutePath } from "../contexts/RouteContext";
import { localizedPath } from "../services/routing";
import { Button } from "./ui/button";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const { locale, t, shell } = useLocale();
  const copy = shell.interface;
  const { user } = useAccount();
  const accountLabels = {
    en: ["Account", "Sign in"],
    ru: ["Кабинет", "Войти"],
    es: ["Cuenta", "Iniciar sesión"],
    fr: ["Compte", "Connexion"],
    nl: ["Account", "Inloggen"],
    pt: ["Conta", "Entrar"],
    ar: ["الحساب", "تسجيل الدخول"],
  };
  const accountLink = (
    <Link href={localizedPath(locale, user ? "/account" : "/login")}>
      {accountLabels[locale][user ? 0 : 1]}
    </Link>
  );
  const { theme, setTheme } = useTheme();
  const pathname = useRoutePath();
  const blogBase = localizedPath(locale, "/blog");
  const isBlogPage = pathname === blogBase || pathname.startsWith(`${blogBase}/`);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const resources = shell.resources;
  const resourceLinks = (["/blog", "/guides", "/compare", "/about"] as const).map(
    (page, index) => (
      <Link
        key={page}
        href={localizedPath(locale, page)}
        aria-current={pathname.endsWith(page) ? "page" : undefined}
        className="rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-card-secondary"
      >
        {[shell.blog, resources[1], resources[2], t("about")][index]}
      </Link>
    ),
  );
  const links = (
    <>
      <Link
        href={localizedPath(locale, "/dashboard")}
        aria-current={pathname.endsWith("/dashboard") ? "page" : undefined}
      >
        {t("footerGenerator")}
      </Link>
      <Link
        href={localizedPath(locale, "/features")}
        aria-current={pathname.endsWith("/features") ? "page" : undefined}
      >
        {resources[0]}
      </Link>
      <Link
        href={localizedPath(locale, "/pricing")}
        aria-current={pathname.endsWith("/pricing") ? "page" : undefined}
      >
        {shell.pricing}
      </Link>
    </>
  );
  return (
    <header className="site-header sticky top-0 z-30 border-b border-border bg-header-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link
          href={localizedPath(locale, "/")}
          className="brand"
          aria-label="AI Letter Generator Homepage"
        >
          <Brand />
        </Link>
        {isBlogPage && <Link href={blogBase} prefetch={false} className="shrink-0 whitespace-nowrap text-sm font-medium text-text-secondary hover:text-accent sm:text-base" aria-current={pathname === blogBase ? "page" : undefined}><span aria-hidden="true">/ </span>Blog</Link>}
        </div>
        <nav
          aria-label={copy.menu}
          className="header-nav hidden items-center gap-6 text-sm xl:flex"
        >
          {links}
          {accountLink}
          <DropdownMenu.Root dir={locale === "ar" ? "rtl" : "ltr"}>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={
                  /\/(blog(?:\/.*)?|guides|compare|about)$/.test(pathname)
                    ? "text-accent"
                    : "text-text-secondary"
                }
              >
                {resources[3]}
                <ChevronDown size={14} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={14}
                className="header-nav z-50 flex min-w-48 flex-col rounded-xl border border-border bg-card p-2 shadow-lg"
              >
                {resourceLinks.map((link, index) => (
                  <DropdownMenu.Item asChild key={index}>
                    {link}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSelector />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={t("themeSwitch", {
              theme: theme === "light" ? "dark" : "light",
            })}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
          <Button asChild size="sm" className="hidden xl:inline-flex">
            <Link href={localizedPath(locale, "/dashboard")}>{copy.start}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label={copy.menu}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label={copy.menu}
          className="header-nav flex flex-col gap-5 border-t border-border bg-header-bg px-6 py-5 xl:hidden"
        >
          {links}
          {resourceLinks}
          {accountLink}
          <Link href={localizedPath(locale, "/privacy")}>{t("privacy")}</Link>
        </nav>
      )}
    </header>
  );
}
