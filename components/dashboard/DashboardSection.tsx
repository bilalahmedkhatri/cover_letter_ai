import { requireUser } from "@/lib/auth/access";
import DashboardHome from "./DashboardHome";
import AccountPanel from "./AccountPanel";
import Generator from "@/components/generator/Generator";
import DraftResult from '@/components/generator/DraftResult';
import type { DraftKind } from '@/contexts/GenerationContext';
import DashboardPage from './DashboardPage';
import { canUseWorkflow } from '@/server/feature-access.mjs';
import { workflows } from '@/services/workflow.mjs';
import { notFound } from 'next/navigation';
export default async function DashboardSection({
  params,
  view,
}: {
  params: Promise<{ locale: string }>;
  view: string;
}) {
  const { locale } = await params;
  const user=await requireUser(locale);
  const result = view.endsWith('/result');
  const workflow = view.replace('/result', '');
  if (Object.hasOwn(workflows,workflow) && !canUseWorkflow(workflow,user)) notFound();
  const content = result ? <DraftResult kind={workflow as DraftKind} /> : view === "overview" ? (
    <DashboardHome />
  ) : view === 'research' ? (
    <Generator kind="research" compact />
  ) : ["university", "email"].includes(view) ? (
    <Generator kind={view as "university" | "email"} />
  ) : (
    <AccountPanel section={view} />
  );
  return <DashboardPage centered={view === "overview"}>{content}</DashboardPage>;
}
