import { requireUser } from "@/lib/auth/access";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { availableWorkflows } from '@/server/feature-access.mjs';
import { PageCopyProvider } from '@/contexts/PageCopyContext';
import { dashboardCopy } from '@/services/dashboardCopy';
import type { Locale } from '@/types';
export const metadata = {
  title: "Your writing dashboard",
  robots: { index: false, follow: true },
};
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user=await requireUser(locale);
  return <PageCopyProvider value={{ dashboard: dashboardCopy(locale as Locale) }}><DashboardShell workflows={availableWorkflows(user)}>{children}</DashboardShell></PageCopyProvider>;
}
