import { requireUser } from "@/lib/auth/access";
import DashboardHome from "./DashboardHome";
import AccountPanel from "./AccountPanel";
import Generator from "@/components/generator/Generator";
export default async function DashboardSection({
  params,
  view,
}: {
  params: Promise<{ locale: string }>;
  view: string;
}) {
  const { locale } = await params;
  await requireUser(locale);
  return view === "overview" ? (
    <DashboardHome />
  ) : ["cover-letter", "university", "email"].includes(view) ? (
    <Generator kind={view as "cover-letter" | "university" | "email"} />
  ) : (
    <AccountPanel section={view} />
  );
}
