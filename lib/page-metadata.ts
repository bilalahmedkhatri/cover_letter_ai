import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMetadata, alternateLocales } from "@/services/seo";
import { localizedPath, localeCodes, siteOrigin, type Page } from "@/services/routing";
import type { Locale } from "@/types";
export async function pageMetadata(
  params: Promise<{ locale: string }>,
  page: Page,
): Promise<Metadata> {
  const { locale: code } = await params;
  if (!localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  const meta = getMetadata(locale, page);
  const privatePage =
    page.startsWith("/dashboard") || ["/login", "/account"].includes(page);
  const alternatives = alternateLocales(page);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    robots: { index: !privatePage, follow: true },
    alternates: {
      canonical: meta.canonical,
      languages: alternatives.length
        ? Object.fromEntries([
            ...alternatives.map((l) => [
              l,
              siteOrigin + localizedPath(l, page),
            ]),
            ["x-default", siteOrigin + localizedPath("en", page)],
          ])
        : undefined,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      locale: meta.ogLocale,
    },
  };
}
