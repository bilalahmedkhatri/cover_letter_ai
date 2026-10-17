import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

let auth: ReturnType<typeof createNeonAuth>;
export const serverAuthConfigured=()=>Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);
export function getServerAuth() {
  if (!serverAuthConfigured())
    throw new Error("Server authentication is not configured.");
  return (auth ||= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
      secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      sessionDataTtl: 60,
    },
  }));
}
