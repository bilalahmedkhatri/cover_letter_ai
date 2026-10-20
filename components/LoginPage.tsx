'use client';
import { Input } from "./ui/input";
import React, { useState, useEffect } from "react";
import { getAuthClient, authConfigured } from "../services/authClient";
import { useAccount } from "../contexts/AccountContext";
import { useLocale } from "../contexts/LocaleContext";
import { localizedPath } from "../services/routing";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Spinner } from './ui/spinner';

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const ru = locale === "ru";
  const { user, refresh } = useAccount();
  useEffect(()=>{if(user)router.replace(localizedPath(locale,'/dashboard'));},[user,locale,router]);
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const resetToken =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token")
      : null;
  const unavailable=typeof window!=='undefined' && new URLSearchParams(window.location.search).get('unavailable')==='1';
  const go = () => {
    router.replace(localizedPath(locale, "/dashboard"));
    router.refresh();
  };
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const authClient = await getAuthClient();
      if (!authClient)
        throw new Error(
          ru ? "Вход пока не настроен." : "Sign-in is not configured yet.",
        );
      const result = resetToken
        ? await authClient.resetPassword({
            newPassword: password,
            token: resetToken,
          })
        : mode === "signup"
          ? await authClient.signUp.email({ email, password, name })
          : mode === "reset"
            ? codeSent
              ? await authClient.emailOtp.resetPassword({
                  email,
                  otp,
                  password,
                })
              : await authClient.emailOtp.sendVerificationOtp({
                  email,
                  type: "forget-password",
                })
            : await authClient.signIn.email({ email, password });
      if (result.error)
        throw new Error(result.error.message || "Unable to sign in.");
      if (mode === "reset" || resetToken) {
        if (mode === "reset" && !codeSent) {
          setCodeSent(true);
          setMessage(
            ru
              ? "Если аккаунт существует, код будет отправлен на почту."
              : "If an account exists, a reset code will be emailed to you.",
          );
        } else {
          window.history.replaceState({}, "", localizedPath(locale, "/login"));
          setMode("login");
          setCodeSent(false);
          setPassword("");
          setMessage(
            ru
              ? "Пароль изменён. Войдите снова."
              : "Password changed. Sign in again.",
          );
        }
      } else {
        await refresh();
        go();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="mx-auto grid max-w-5xl gap-12 py-6 lg:grid-cols-2"
      lang={ru ? "ru" : "en"}
      dir="ltr"
    >
      <div>
        <p className="eyebrow">
          {ru ? "Ваш рабочий кабинет" : "Your writing account"}
        </p>
        <h1 className="editorial-title mt-5">
          {ru
            ? "Ваши письма. В одном месте."
            : "Your letters. All in one place."}
        </h1>
        <p className="mt-6 leading-8 text-text-secondary">
          {ru
            ? "Открывайте историю сопроводительных писем, используйте сведения о себе и продолжайте работу с другого устройства. Проверяйте свой тариф и историю платежей."
            : "Open your cover letter history, reuse your background and continue from another device. View your plan and payment history."}
        </p>
        <ul className="mt-8 space-y-4 text-text-secondary">
          <li>
            {ru
              ? "Редактируемые сопроводительные письма"
              : "Editable job cover letters"}
          </li>
          <li>
            {ru
              ? "Профиль, язык и предпочтения"
              : "Profile, language and writing preferences"}
          </li>
          <li>
            {ru
              ? "История чатов и платежей"
              : "Chat history and payment history"}
          </li>
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
        {user ? (
          <Spinner label={ru ? 'Открываем кабинет…' : 'Opening dashboard…'} />
        ) : (
          <>
            <h2 className="text-2xl font-semibold">
              {resetToken
                ? ru
                  ? "Новый пароль"
                  : "Set a new password"
                : mode === "signup"
                  ? ru
                    ? "Создать аккаунт"
                    : "Create your account"
                  : mode === "reset"
                    ? ru
                      ? "Сбросить пароль"
                      : "Reset your password"
                    : ru
                      ? "Войти"
                      : "Welcome back"}
            </h2>
            <form onSubmit={submit} className="mt-7 space-y-5">
              {mode === "signup" && !resetToken && (
                <label className="block text-sm">
                  {ru ? "Имя" : "Name"}
                  <Input
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3"
                  />
                </label>
              )}
              {!resetToken && (
                <label className="block text-sm">
                  Email
                  <Input
                    required
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3"
                  />
                </label>
              )}
              {mode === "reset" && codeSent && (
                <label className="block text-sm">
                  {ru ? "Код из письма" : "Email verification code"}
                  <Input
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={10}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3"
                  />
                </label>
              )}
              {(mode !== "reset" || resetToken || codeSent) && (
                <label className="block text-sm">
                  {ru ? "Пароль" : "Password"}
                  <Input
                    required
                    type="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete={
                      mode === "login" && !resetToken
                        ? "current-password"
                        : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-3"
                  />
                </label>
              )}
              {mode === "signup" && (
                <p className="text-xs leading-6 text-text-secondary">
                  {ru
                    ? "Создавая аккаунт, вы принимаете "
                    : "By creating an account, you accept our "}
                  <a
                    className="underline"
                    href={localizedPath(locale, "/terms")}
                  >
                    {ru ? "условия" : "terms"}
                  </a>
                  {ru ? " и " : " and "}
                  <a
                    className="underline"
                    href={localizedPath(locale, "/privacy")}
                  >
                    {ru ? "политику конфиденциальности" : "privacy policy"}
                  </a>
                  .
                </p>
              )}
              <Button
                type="submit"
                disabled={!ready || busy || !authConfigured}
                className="w-full"
              >
                {busy
                  ? ru
                    ? "Подождите…"
                    : "Please wait…"
                  : resetToken || (mode === "reset" && codeSent)
                    ? ru
                      ? "Сохранить пароль"
                      : "Save password"
                    : mode === "signup"
                      ? ru
                        ? "Создать аккаунт"
                        : "Create account"
                      : mode === "reset"
                        ? ru
                          ? "Отправить код"
                          : "Send reset code"
                        : ru
                          ? "Войти"
                          : "Sign in"}
              </Button>
            </form>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <button
                disabled={!ready || busy}
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setMessage("");
                }}
                className="text-accent underline"
              >
                {mode === "signup"
                  ? ru
                    ? "Уже есть аккаунт?"
                    : "Already have an account?"
                  : ru
                    ? "Создать аккаунт"
                    : "Create an account"}
              </button>
              <button
                disabled={!ready || busy}
                className="text-text-secondary underline"
                onClick={() => {
                  setMode("reset");
                  setMessage("");
                }}
              >
                {ru ? "Забыли пароль?" : "Forgot password?"}
              </button>
            </div>
          </>
        )}
        {(message || unavailable) && (
          <p
            role="status"
            className="mt-5 rounded-lg border border-border p-3 text-sm"
          >
            {message || (ru ? 'Вход временно недоступен. Попробуйте позже.' : 'Sign-in is temporarily unavailable. Please try again later.')}
          </p>
        )}
        {!authConfigured && (
          <p className="mt-5 text-sm">
            {ru
              ? "Вход будет доступен после настройки сервиса."
              : "Sign-in will be available once account configuration is deployed."}
          </p>
        )}
      </div>
    </section>
  );
}
