import { requireUser } from "@/lib/auth/access";
import DashboardShell from "@/components/dashboard/DashboardShell";
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
  await requireUser(locale);
  return <DashboardShell>{children}</DashboardShell>;
}
