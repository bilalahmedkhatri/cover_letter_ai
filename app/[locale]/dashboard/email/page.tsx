import DashboardSection from "@/components/dashboard/DashboardSection";
export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <DashboardSection params={params} view="email" />;
}
