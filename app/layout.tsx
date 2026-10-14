import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://ailettergen.com"),
  title: {
    default: "AI Letter Generator",
    template: "%s | AI Letter Generator",
  },
  description:
    "Write thoughtful job cover letters, university applications and professional outreach emails.",
  icons: { icon: "/icon.svg?v=3", apple: "/icon.svg?v=3" },
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
      <body>{children}</body>
    </html>
  );
}
