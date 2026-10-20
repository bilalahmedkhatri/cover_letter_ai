import Content from '@/components/LoginPage';
import PublicPage from "@/components/PublicPage";
import { pageMetadata } from "@/lib/page-metadata";
import { requestIdentity } from '@/lib/auth/access';
import { redirect } from 'next/navigation';
export const generateMetadata = ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => pageMetadata(params, "/login");
export default async function Page({params}: {params: Promise<{locale:string}>}) {
  const {locale}=await params;
  if(await requestIdentity()) redirect(`/${locale}/dashboard`);
  return <PublicPage locale={locale} page="/login"><Content/></PublicPage>;
}
