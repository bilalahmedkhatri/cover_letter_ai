import DeleteDraftDialog from "./dashboard/DeleteDraftDialog";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { useAccount } from "../contexts/AccountContext";
import { useLocale } from "../contexts/LocaleContext";
import { useFormState } from "../contexts/FormStateContext";
import { useGeneration } from "../contexts/GenerationContext";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { getAuthClient, accountRequest } from "../services/authClient";
import { localizedPath } from "../services/routing";
import { Button } from "./ui/button";
import { LetterTone } from "../types";

type Document = {
  id: string;
  kind: "letter" | "email" | "research";
  title: string;
  content: string;
  context: Record<string, unknown>;
  updatedAt: string;
};
type Profile = {
  name: string;
  skills: string;
  experience: string;
  language: string;
  tone: LetterTone;
};
type Overview = {
  profile: Profile;
  documents: Document[];
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
  initialTab = "library",
}: {
  initialTab?: string;
}) {
  const router = useRouter();
  const { user, loading, refresh } = useAccount();
  const { locale } = useLocale();
  const ru = locale === "ru";
  const { setUserData, setJobDetails, setCurrentStep } = useFormState();
  const {
    setCoverLetter,
    setAdmissionInfo,
    setFoundCourses,
    setAnalysisNotes,
  } = useGeneration();
  const [data, setData] = useState<Overview | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selected, setSelected] = useState<Document | null>(null);
  const [query, setQuery] = useState("");
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
      setMessage(ru ? "Сохранено." : "Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    try {
      const result = await (await getAuthClient())?.signOut();
      if (result?.error) throw new Error("Unable to sign out.");
      await refresh();
      setData(null);
      setSelected(null);
      setProfile(null);
      setCoverLetter("");
      setUserData((previous) => ({
        ...previous,
        name: "",
        skills: "",
        experience: "",
        resume: null,
        headerInfo: "",
        footerInfo: "",
        customInstruction: "",
        universityUrl: "",
        courseName: "",
        universityAnalysisInstruction: "",
      }));
      setJobDetails({ url: "", screenshot: null });
      setCurrentStep(1);
      setAdmissionInfo(null);
      setFoundCourses([]);
      setAnalysisNotes("");
      router.replace(localizedPath(locale, "/login"));
      router.refresh();
    } catch {
      setMessage(
        l(
          "Unable to sign out. Please try again.",
          "Не удалось выйти. Попробуйте снова.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  const l = (en: string, russian: string) => (ru ? russian : en);
  if (loading)
    return <p role="status">{l("Loading your account…", "Загрузка…")}</p>;
  if (!user)
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-9">
        <h1 className="editorial-title">{l("Your account", "Ваш кабинет")}</h1>
        <p className="mt-5 text-text-secondary">
          {l(
            "Sign in to access your saved letters, research notes, profile and plan.",
            "Войдите, чтобы открыть письма, заметки, профиль и тариф.",
          )}
        </p>
        <Button asChild className="mt-7">
          <a href={localizedPath(locale, "/login")}>
            {l("Sign in or create an account", "Войти или создать аккаунт")}
          </a>
        </Button>
      </section>
    );
  const filtered =
    data?.documents.filter((item) =>
      (item.title + item.content).toLowerCase().includes(query.toLowerCase()),
    ) || [];
  return (
    <div lang={ru ? "ru" : "en"} dir="ltr" className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{l("Your account", "Ваш кабинет")}</p>
          <h1 className="editorial-title mt-3 break-words">
            {user.name || l("Writing workspace", "Рабочий кабинет")}
          </h1>
          <p className="mt-3 text-text-secondary">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <a href={localizedPath(locale, "/dashboard")}>
              {l("Write a letter", "Создать письмо")}
            </a>
          </Button>
          <Button variant="outline" disabled={busy} onClick={signOut}>
            {l("Sign out", "Выйти")}
          </Button>
        </div>
      </header>
      {message && (
        <p
          role="status"
          className="rounded-xl border border-border bg-card p-4 text-sm"
        >
          {message}
        </p>
      )}
      {!data ? (
        <Button
          onClick={() => load().catch((error) => setMessage(error.message))}
        >
          {l("Reload account", "Загрузить кабинет")}
        </Button>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [
                l("Saved letters", "Сохранённые письма"),
                data.documents.filter((d) => d.kind !== "research").length,
              ],
              [
                l("Research notes", "Заметки исследований"),
                data.documents.filter((d) => d.kind === "research").length,
              ],
              [
                l("Current plan", "Текущий тариф"),
                data.account?.active
                  ? data.account.plan
                  : l("Free workspace", "Бесплатный режим"),
              ],
            ].map(([title, value]) => (
              <div
                key={String(title)}
                className="rounded-xl border border-border bg-card p-6"
              >
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="mt-3 text-2xl font-semibold capitalize">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <Tabs.Root key={initialTab} defaultValue={initialTab}>
            <Tabs.List
              aria-label={l("Account sections", "Разделы кабинета")}
              className="flex flex-wrap gap-2 border-b border-border pb-4"
            >
              {[
                ["library", l("Letters & research", "Письма и исследования")],
                ["profile", l("Profile & preferences", "Профиль")],
                ["billing", l("Plan & payments", "Тариф и платежи")],
                ["feedback", l("Share feedback", "Оставить отзыв")],
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
            <Tabs.Content value="library" className="mt-6 space-y-6">
              <label className="block max-w-md text-sm">
                {l("Search your library", "Поиск в библиотеке")}
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-card p-3"
                />
              </label>
              <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
                <div className="space-y-3">
                  {!filtered.length && (
                    <p className="rounded-xl border border-dashed border-border p-7 leading-7 text-text-secondary">
                      {l(
                        "Your library is empty. Open the generator and choose “Save to account” after reviewing a draft. You can also save university research notes there.",
                        "Библиотека пуста. Создайте черновик и нажмите «Сохранить в аккаунт». Заметки об университетах тоже можно сохранить.",
                      )}
                    </p>
                  )}
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      aria-pressed={selected?.id === item.id}
                      className="block w-full rounded-xl border border-border bg-card p-5 text-left hover:border-accent"
                    >
                      <span className="text-xs uppercase text-text-secondary">
                        {item.kind}
                      </span>
                      <h2 className="mt-2 font-semibold">{item.title}</h2>
                      <p className="mt-2 text-xs text-text-muted">
                        {new Date(item.updatedAt).toLocaleDateString(locale)}
                      </p>
                    </button>
                  ))}
                </div>
                {selected && (
                  <article className="rounded-xl border border-border bg-card p-5">
                    <label className="block text-sm">
                      {l("Title", "Название")}
                      <Input
                        maxLength={160}
                        value={selected.title}
                        onChange={(e) =>
                          setSelected({ ...selected, title: e.target.value })
                        }
                        className="mt-2 w-full rounded-lg border border-border bg-background p-3"
                      />
                    </label>
                    <label className="mt-4 block text-sm">
                      {l("Draft", "Черновик")}
                      <Textarea
                        rows={16}
                        maxLength={20000}
                        value={selected.content}
                        onChange={(e) =>
                          setSelected({ ...selected, content: e.target.value })
                        }
                        className="mt-2 w-full rounded-lg border border-border bg-background p-4 leading-7"
                      />
                    </label>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        disabled={busy}
                        onClick={() =>
                          action({ action: "document", ...selected })
                        }
                      >
                        {l("Save changes", "Сохранить")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCoverLetter(selected.content);
                          setUserData((previous) => ({
                            ...previous,
                            ...selected.context,
                            documentType:
                              selected.kind === "email" ? "email" : "letter",
                            resume: null,
                          }));
                          router.push(
                            localizedPath(
                              locale,
                              selected.kind === "email"
                                ? "/dashboard/email"
                                : selected.context.letterType === "university"
                                  ? "/dashboard/university"
                                  : "/dashboard/cover-letter",
                            ),
                          );
                        }}
                      >
                        {l(
                          "Open in editor & export",
                          "Открыть и экспортировать",
                        )}
                      </Button>
                      <DeleteDraftDialog
                        label={l("Delete", "Удалить")}
                        onDelete={async () => {
                          await accountRequest({
                            action: "delete",
                            id: selected.id,
                          });
                          setSelected(null);
                          await load();
                        }}
                      />
                    </div>
                  </article>
                )}
              </div>
            </Tabs.Content>
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
                        ? l("Name", "Имя")
                        : field === "skills"
                          ? l("Skills", "Навыки")
                          : l("Experience", "Опыт")}
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
                      {l("Writing language", "Язык письма")}
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
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      {l("Tone", "Тон")}
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
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button disabled={busy} type="submit">
                      {l("Save profile", "Сохранить профиль")}
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
                          localizedPath(locale, "/dashboard/cover-letter"),
                        );
                      }}
                    >
                      {l(
                        "Use profile in generator",
                        "Использовать в генераторе",
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </Tabs.Content>
            <Tabs.Content value="billing" className="mt-6 space-y-7">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold">
                  {l("Plan and remaining usage", "Тариф и доступный объём")}
                </h2>
                {data.account?.active ? (
                  <>
                    <p className="mt-3 capitalize">
                      {data.account.plan} · {l("Until", "До")}{" "}
                      {new Date(data.account.expiresAt).toLocaleDateString(
                        locale,
                      )}
                    </p>
                    <p className="mt-3 text-text-secondary">
                      {data.account.remaining.standardLetters}{" "}
                      {l("standard letters", "стандартных писем")} /{" "}
                      {data.account.remaining.premiumLetters}{" "}
                      {l("premium letters", "премиум-писем")} /{" "}
                      {data.account.remaining.universityResearch}{" "}
                      {l("research requests", "исследований")}
                    </p>
                    <p className="mt-3 text-sm text-text-secondary">
                      {l(
                        "These are alternative maximums from one shared allowance. Mixed usage reduces the remaining amounts.",
                        "Это альтернативные максимумы общего лимита. Смешанное использование уменьшает остатки.",
                      )}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-text-secondary">
                    {l(
                      "No active paid plan. You can use the current writing workspace and save your drafts.",
                      "Активного платного тарифа нет. Можно пользоваться редактором и сохранять черновики.",
                    )}
                  </p>
                )}
                <Button asChild variant="outline" className="mt-5">
                  <a href={localizedPath(locale, "/pricing")}>
                    {l("View plans", "Посмотреть тарифы")}
                  </a>
                </Button>
              </div>
              <h2 className="text-xl font-semibold">
                {l("Payment history", "История платежей")}
              </h2>
              {!data.orders.length ? (
                <p className="text-text-secondary">
                  {l("No payments yet.", "Платежей пока нет.")}
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
                        {order.status} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString(locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Content>
            <Tabs.Content value="feedback" className="mt-6 max-w-2xl">
              <ReviewForm
                busy={busy}
                submit={action}
                name={user.name}
                ru={ru}
              />
            </Tabs.Content>
          </Tabs.Root>
        </>
      )}
    </div>
  );
}
function ReviewForm({
  name,
  ru,
  busy,
  submit,
}: {
  name: string;
  ru: boolean;
  busy: boolean;
  submit: (value: object) => Promise<void>;
}) {
  const [displayName, setName] = useState(name);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          action: "review",
          id: crypto.randomUUID(),
          name: displayName,
          content,
          rating,
          consent,
        });
      }}
    >
      <h2 className="text-xl font-semibold">
        {ru ? "Расскажите о своём опыте" : "Tell us about your experience"}
      </h2>
      <p className="text-sm leading-7 text-text-secondary">
        {ru
          ? "Отзыв появится на главной после проверки. Не включайте личные сведения из заявлений."
          : "Your review will be checked before publication. Share what worked and what could improve; leave out private application details."}
      </p>
      <label className="block text-sm">
        {ru ? "Публичное имя" : "Public display name"}
        <Input
          required
          maxLength={80}
          value={displayName}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-card p-3"
        />
      </label>
      <label className="block text-sm">
        {ru ? "Оценка" : "Rating"}
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="ml-4 rounded-lg border border-border bg-card p-3"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <Textarea
        required
        minLength={20}
        maxLength={1500}
        rows={5}
        aria-label={ru ? "Текст отзыва" : "Review text"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-lg border border-border bg-card p-4"
      />
      <label className="flex gap-3 text-sm leading-6">
        <input
          required
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        {ru
          ? "Разрешаю публикацию имени, оценки и текста на сайте."
          : "I agree to publish my display name, rating and review on this website."}
      </label>
      <Button type="submit" disabled={busy}>
        {ru ? "Отправить на проверку" : "Submit for review"}
      </Button>
    </form>
  );
}
