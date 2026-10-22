import Content from '@/components/PrivacyPolicy';
import PublicPage from "@/components/PublicPage";
import { pageMetadata } from "@/lib/page-metadata";
import type { Locale } from '@/types';
export const generateMetadata = ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => pageMetadata(params, "/privacy");
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PublicPage locale={locale} page="/privacy"><Content locale={locale as Locale}/></PublicPage>;
}
