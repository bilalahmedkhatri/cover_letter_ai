import { requireUser } from "@/lib/auth/access";
import { redirect } from "next/navigation";
export const metadata = { robots: { index: false, follow: true } };
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireUser(locale);
  redirect("/" + locale + "/dashboard/drafts");
}
