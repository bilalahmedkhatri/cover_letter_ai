import { useDashboardCopy } from '@/hooks/use-dashboard-copy';
import { languageLabel, paymentStatusLabels } from '@/services/dashboardLabels';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { useAccount } from "../contexts/AccountContext";
import { useLocale } from "../contexts/LocaleContext";
import { useFormState } from "../contexts/FormStateContext";
import { Textarea } from "./ui/textarea";
import { accountRequest } from "../services/authClient";
import { useSignOut } from '../hooks/use-sign-out';
import { localizedPath } from "../services/routing";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { LetterTone } from "../types";
import { useDashboardAccount } from './dashboard/DashboardAccount';

type Profile = {
  name: string;
  skills: string;
  experience: string;
  language: string;
  tone: LetterTone;
};
type Overview = {
  profile: Profile;
  orders: {
    id: string;
    plan: string;
    status: string;
    priceCents: number;
    createdAt: string;
  }[];
  account: null | {
    plan: string;
    active: boolean;
    expiresAt: number;
    remaining: {
      standardLetters: number;
      premiumLetters: number;
      universityResearch: number;
    };
  };
};
export default function AccountPage({
  initialTab = "profile",
  embedded = false,
}: {
  initialTab?: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const { user, loading } = useAccount();
  const { workflows: available } = useDashboardAccount();
  const logout = useSignOut();
  const { locale } = useLocale();
  const d = useDashboardCopy();
  const { setUserData } = useFormState();
  const [data, setData] = useState<Overview | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() {
    const result = await accountRequest();
    setData(result);
    setProfile(result.profile);
  }
  useEffect(() => {
    let alive = true;
    if (user)
      accountRequest()
        .then((result) => {
          if (alive) {
            setData(result);
            setProfile(result.profile);
          }
        })
        .catch((error) => {
          if (alive) setMessage(error.message);
        });
    else {
      setData(null);
      setProfile(null);
    }
    return () => {
      alive = false;
    };
  }, [user?.id]);
  async function action(value: object) {
    setBusy(true);
    setMessage("");
    try {
      await accountRequest(value);
      await load();
      setMessage(d('Saved.'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : d('Please try again.'));
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    try {
      await logout();
    } catch {
      setMessage(
        d('Unable to sign out. Please try again.'),
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return <Spinner className="flex w-full py-8" label={d('Loading your account…')} />;
  if (!user)
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-9">
        <h1 className="editorial-title">{d('Your account')}</h1>
        <p className="mt-5 text-text-secondary">
          {d('Sign in to access your chat history, profile and plan.')}
        </p>
        <Button asChild className="mt-7">
          <a href={localizedPath(locale, "/login")}>
            {d('Sign in or create an account')}
          </a>
        </Button>
      </section>
    );
  return (
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="space-y-8">
      {!embedded && <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{d('Your account')}</p>
          <h1 className="editorial-title mt-3 break-words">
            {user.name || d('Writing workspace')}
          </h1>
          <p className="mt-3 text-text-secondary">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <a href={localizedPath(locale, "/dashboard")}>
              {d('Write a letter')}
            </a>
          </Button>
          <Button variant="outline" disabled={busy} onClick={signOut}>
            {d('Sign out')}
          </Button>
        </div>
      </header>}
      {message && (
        <p
          role="status"
          className="rounded-xl border border-border bg-card p-4 text-sm"
        >
          {message}
        </p>
      )}
      {!data ? !message ? <Spinner className="flex w-full py-8" label={d('Loading your account…')} /> : embedded ? <p role="status">{d('Unable to load your account.')}</p> : (
        <Button
          onClick={() => load().catch((error) => setMessage(error.message))}
        >
          {d('Reload account')}
        </Button>
      ) : (
        <>
          <Tabs.Root key={initialTab} defaultValue={initialTab}>
            <Tabs.List
              aria-label={d('Account sections')}
              className={embedded ? 'hidden' : 'flex flex-wrap gap-2 border-b border-border pb-4'}
            >
              {[
                ["profile", d('Profile & preferences')],
                ["billing", d('Plan & payments')],
              ].map(([value, title]) => (
                <Tabs.Trigger
                  key={value}
                  value={value}
                  className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-card-secondary data-[state=active]:text-text-primary data-[state=active]:font-semibold"
                >
                  {title}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="profile" className="mt-6 max-w-2xl">
              {profile && (
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    action({ action: "profile", ...profile });
                  }}
                >
                  {(["name", "skills", "experience"] as const).map((field) => (
                    <label key={field} className="block text-sm capitalize">
                      {field === "name"
                        ? d('Name')
                        : field === "skills"
                          ? d('Skills')
                          : d('Experience')}
                      <Textarea
                        rows={field === "name" ? 1 : 4}
                        maxLength={
                          field === "name"
                            ? 120
                            : field === "skills"
                              ? 4000
                              : 6000
                        }
                        value={profile[field]}
                        onChange={(e) =>
                          setProfile({ ...profile, [field]: e.target.value })
                        }
                        className="mt-2 w-full rounded-lg border border-border bg-card p-3"
                      />
                    </label>
                  ))}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      {d('Writing language')}
                      <select
                        className="mt-2 w-full rounded-lg border border-border bg-card p-3"
                        value={profile.language}
                        onChange={(e) =>
                          setProfile({ ...profile, language: e.target.value })
                        }
                      >
                        {[
                          "English",
                          "Russian",
                          "Spanish",
                          "French",
                          "Arabic",
                          "Dutch",
                          "Portuguese",
                          "Bulgarian",
                          "Hungarian",
                          "Slovak",
                          "Polish",
                        ].map((value) => (
                          <option key={value} value={value}>{languageLabel(locale, value)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      {d('Tone')}
                      <select
                        className="mt-2 w-full rounded-lg border border-border bg-card p-3"
                        value={profile.tone}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            tone: e.target.value as LetterTone,
                          })
                        }
                      >
                        {[
                          "Professional",
                          "Formal",
                          "Enthusiastic",
                          "Concise",
                        ].map((value) => (
                          <option key={value} value={value}>{d(value)}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button disabled={busy} type="submit">
                      {d('Save profile')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUserData((previous) => ({
                          ...previous,
                          ...profile,
                        }));
                        router.push(
                          localizedPath(locale, "/dashboard"),
                        );
                      }}
                    >
                      {d('Use profile in generator')}
                    </Button>
                  </div>
                </form>
              )}
            </Tabs.Content>
            <Tabs.Content value="billing" className="mt-6 space-y-7">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold">
                  {d('Plan and remaining usage')}
                </h2>
                {data.account?.active ? (
                  <>
                    <p className="mt-3 capitalize">
                      {data.account.plan} · {d('Until')}{" "}
                      {new Date(data.account.expiresAt).toLocaleDateString(
                        locale,
                      )}
                    </p>
                    <p className="mt-3 text-text-secondary">
                      {data.account.remaining.standardLetters}{" "}
                      {d('standard letters')} /{" "}
                      {data.account.remaining.premiumLetters}{" "}
                      {d('premium letters')}
                      {available.includes('research') && <> /{" "}
                      {data.account.remaining.universityResearch}{" "}
                      {d('research requests')}</>}
                    </p>
                    <p className="mt-3 text-sm text-text-secondary">
                      {d('These are alternative maximums from one shared allowance. Mixed usage reduces the remaining amounts.')}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-text-secondary">
                    {d('No active paid plan. You can use the current writing workspace and chat history.')}
                  </p>
                )}
                <Button asChild variant="outline" className="mt-5">
                  <a href={localizedPath(locale, "/pricing")}>
                    {d('View plans')}
                  </a>
                </Button>
              </div>
              <h2 className="text-xl font-semibold">
                {d('Payment history')}
              </h2>
              {!data.orders.length ? (
                <p className="text-text-secondary">
                  {d('No payments yet.')}
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.orders.map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-wrap justify-between gap-3 rounded-xl border border-border p-4"
                    >
                      <span className="capitalize">
                        {order.plan} · ${(order.priceCents / 100).toFixed(2)}
                      </span>
                      <span>
                        {d(paymentStatusLabels[order.status] || 'Payment status unavailable')} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString(locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </>
      )}
    </div>
  );
}
