/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: true },
      {
        source: "/dashboard/:path*",
        destination: "/en/dashboard/:path*",
        permanent: false,
      },
      ...[
        "login",
        "account",
        "about",
        "privacy",
        "terms",
        "pricing",
        "features",
        "guides",
        "compare",
        "blog",
      ].map((page) => ({
        source: `/${page}`,
        destination: `/en/${page}`,
        permanent: true,
      })),
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ailettergen.com" }],
        destination: "https://ailettergen.com/:path*",
        permanent: true,
      },
    ];
  },
};
export default config;
