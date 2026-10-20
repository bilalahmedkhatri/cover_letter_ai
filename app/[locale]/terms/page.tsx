import Content from '@/components/TermsOfService';
import PublicPage from "@/components/PublicPage";
import { pageMetadata } from "@/lib/page-metadata";
export const generateMetadata = ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => pageMetadata(params, "/terms");
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PublicPage locale={locale} page="/terms"><Content/></PublicPage>;
}
