import { notFound } from "next/navigation";
import { localeCodes } from "@/services/routing";
import AppProviders from "@/components/AppProviders";
import SiteShell from "@/components/SiteShell";
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!localeCodes.includes(locale as (typeof localeCodes)[number])) notFound();
  return (
    <AppProviders>
      <SiteShell>{children}</SiteShell>
    </AppProviders>
  );
}
