import { Input } from "./ui/input";
import React, { useState } from "react";
import { useAccount } from "../contexts/AccountContext";
import { useLocale } from "../contexts/LocaleContext";
import { accountRequest } from "../services/authClient";
import { localizedPath } from "../services/routing";
import { Button } from "./ui/button";

export default function SaveToAccount({
  content,
  kind,
  context = {},
  defaultTitle,
}: {
  content: string;
  kind: "letter" | "email" | "research";
  context?: object;
  defaultTitle: string;
}) {
  const { user } = useAccount();
  const { locale } = useLocale();
  const ru = locale === "ru";
  const [title, setTitle] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!content) return null;
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const documentId = id || crypto.randomUUID();
      await accountRequest({
        action: "document",
        id: documentId,
        kind,
        title: title.trim() || defaultTitle,
        content,
        context,
      });
      setId(documentId);
      setMessage(ru ? "Сохранено в аккаунт." : "Saved to your account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold">
        {kind === "research"
          ? ru
            ? "Сохранить заметки"
            : "Save research notes"
          : ru
            ? "Сохранить письмо"
            : "Keep this draft"}
      </h2>
      {user ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Input
            aria-label={ru ? "Название" : "Draft title"}
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={defaultTitle}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <Button disabled={busy} onClick={save}>
            {busy
              ? ru
                ? "Сохранение…"
                : "Saving…"
              : ru
                ? "Сохранить в аккаунт"
                : "Save to account"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setId(null);
              setMessage(
                ru
                  ? "Следующее сохранение создаст новую копию."
                  : "The next save will create a new copy.",
              );
            }}
          >
            {ru ? "Новая копия" : "Save as new next time"}
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          {ru
            ? "Войдите, чтобы сохранить выбранный текст и открыть его с другого устройства."
            : "Sign in to save this text and reopen it on another device."}{" "}
          <a
            className="text-accent underline"
            href={localizedPath(locale, "/login")}
          >
            {ru ? "Войти" : "Sign in"}
          </a>
        </p>
      )}
      {message && (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
