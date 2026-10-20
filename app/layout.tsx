import type { Metadata } from "next";
import { headers } from "next/headers";
import PrivateAnalytics from '@/components/PrivateAnalytics';
import "./globals.css";
import { socialImage } from '@/services/seo';
import WorkspaceProviders from '@/components/WorkspaceProviders';
export const metadata: Metadata = {
  metadataBase: new URL("https://ailettergen.com"),
  title: {
    default: "AI Letter Generator",
    template: "%s | AI Letter Generator",
  },
  description:
    "Write thoughtful job cover letters, university applications and professional outreach emails.",
  icons: { icon: "/icon.svg?v=3", apple: "/icon.svg?v=3" },
  openGraph: {type:'website',siteName:'ailettergen',images:[socialImage]},
  twitter: {card:'summary_large_image',images:[socialImage]},
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get("x-site-locale") || "en";
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="dark theme-dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <WorkspaceProviders>{children}</WorkspaceProviders>
        <PrivateAnalytics />
      </body>
    </html>
  );
}
