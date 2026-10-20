import Content from '@/components/ResourcePages';
import PublicPage from "@/components/PublicPage";
import { pageMetadata } from "@/lib/page-metadata";
export const generateMetadata = ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => pageMetadata(params, "/features");
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PublicPage locale={locale} page="/features"><Content page="/features"/></PublicPage>;
}
