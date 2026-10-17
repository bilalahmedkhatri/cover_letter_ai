import "server-only";
import { redirect } from "next/navigation";
import { getServerAuth, serverAuthConfigured } from "./server";

export async function requireUser(locale = "en") {
  if (!serverAuthConfigured()) redirect(`/${locale}/login?unavailable=1`);
  const { data, error } = await getServerAuth().getSession();
  if (error)
    throw new Error("Unable to verify your session. Please try again.");
  if (!data?.user) redirect(`/${locale}/login`);
  return data.user;
}
export async function requestIdentity() {
  if (!serverAuthConfigured()) return null;
  const { data, error } = await getServerAuth().getSession();
  if (error || !data?.user) return null;
  return { id: data.user.id, name: data.user.name || "", email: data.user.email, emailVerified: data.user.emailVerified };
}
