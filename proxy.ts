import { NextResponse, type NextRequest } from "next/server";
import { getServerAuth } from "@/lib/auth/server";
import { localeCodes, resolveRoute } from "@/services/routing";
export async function proxy(request: NextRequest) {
  const part = request.nextUrl.pathname.split("/")[1];
  const supportedLocale = localeCodes.includes(part as (typeof localeCodes)[number]);
  const locale = supportedLocale
    ? part
    : "en";
  const headers = new Headers(request.headers);
  headers.set("x-site-locale", locale);
  // Unknown prefixes otherwise match [locale] and can stream a 200 fallback.
  // Preserve the requested URL while rendering our existing 404 with its status.
  const publicFiles = ["/", "/icon.svg", "/pdf.worker.min.mjs", "/robots.txt", "/sitemap.xml"];
  const missingArticle = supportedLocale && request.nextUrl.pathname.startsWith(`/${locale}/blog/`) && resolveRoute(request.nextUrl.pathname).page === '/404';
  if (missingArticle || (!supportedLocale && !publicFiles.includes(request.nextUrl.pathname))) {
    return NextResponse.rewrite(new URL(`/${locale}/__not-found`, request.url), {
      status: 404,
      request: { headers },
    });
  }
  const response = NextResponse.next({ request: { headers } });
  if (request.nextUrl.pathname.startsWith(`/${locale}/dashboard`)) {
    const protectedResponse = await getServerAuth().middleware({
      loginUrl: `/${locale}/login`,
    })(request);
    if (protectedResponse.status !== 200) return protectedResponse;
    for (const cookie of protectedResponse.cookies.getAll())
      response.cookies.set(cookie);
  }
  return response;
}
export const config = { matcher: ["/((?!api/|_next/).*)"] };
