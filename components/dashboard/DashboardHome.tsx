"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, GraduationCap, Mail, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/contexts/AccountContext";
import { useLocale } from "@/contexts/LocaleContext";
import { accountRequest } from "@/services/authClient";
import PageLoading from "../PageLoading";
type Overview = {
  documents: { id: string; title: string; kind: string; updatedAt: string }[];
  account: null | {
    plan: string;
    active: boolean;
    credits: number;
    remaining: {
      standardLetters: number;
      premiumLetters: number;
      universityResearch: number;
    };
  };
};
const actions = [
  [
    "cover-letter",
    "Cover letter",
    "Connect your experience to a specific role.",
    FileText,
  ],
  [
    "university",
    "University application",
    "Explain your academic direction and programme fit.",
    GraduationCap,
  ],
  [
    "email",
    "Professional email",
    "Make a clear introduction, request or follow-up.",
    Mail,
  ],
] as const;
export default function DashboardHome() {
  const { user } = useAccount();
  const { locale } = useLocale();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    accountRequest()
      .then((r) => {
        if (active) setData(r);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);
  if (error)
    return (
      <Card role="alert">
        <CardHeader>
          <CardTitle>Unable to load your dashboard</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            Reload dashboard
          </Button>
        </CardContent>
      </Card>
    );
  if (!data) return <PageLoading />;
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-3 text-text-secondary">
          Start a new draft, or pick up where you left off.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Subscription</CardDescription>
            <CardTitle className="capitalize">
              {data.account?.active ? data.account.plan : "Free workspace"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {data.account?.active ? "Active plan" : "No paid plan"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Credit balance</CardDescription>
            <CardTitle>
              {data.account?.active ? data.account.credits : 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary">
            {data.account?.active
              ? "Shared allowance across generation types."
              : "Free access: up to 3 generations per day."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Saved drafts & research</CardDescription>
            <CardTitle>{data.documents.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              className="text-sm underline"
              href={`/${locale}/dashboard/drafts`}
            >
              Open your library
            </Link>
          </CardContent>
        </Card>
      </div>
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          What would you like to write?
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {actions.map(([path, title, description, Icon]) => (
            <Link
              key={path}
              href={`/${locale}/dashboard/${path}`}
              className="group"
            >
              <Card className="h-full transition-colors hover:border-emerald-500">
                <CardHeader>
                  <Icon className="mb-3 size-6 text-emerald-500" />
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-emerald-500">
                  Create a draft
                  <ArrowUpRight className="size-4" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent drafts</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${locale}/dashboard/drafts`}>View all</Link>
          </Button>
        </div>
        {!data.documents.length ? (
          <Card>
            <CardContent className="py-9 text-text-secondary">
              No saved drafts yet. Generate a letter and choose “Save to
              account”.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.documents.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                href={`/${locale}/dashboard/drafts`}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4"
              >
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {new Date(d.updatedAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <Badge variant="outline">{d.kind}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
