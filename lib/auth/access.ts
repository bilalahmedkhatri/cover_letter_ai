import "server-only";
import { redirect } from "next/navigation";
import { getServerAuth } from "./server";

export async function requireUser(locale = "en") {
  const { data, error } = await getServerAuth().getSession();
  if (error)
    throw new Error("Unable to verify your session. Please try again.");
  if (!data?.user) redirect(`/${locale}/login`);
  return data.user;
}
export async function requestIdentity() {
  const { data, error } = await getServerAuth().getSession();
  if (error || !data?.user) return null;
  return { id: data.user.id, name: data.user.name || "" };
}
