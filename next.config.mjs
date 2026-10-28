/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Blocking metadata lets the published-post lookup return 404 before an
  // existing loading boundary commits HTTP 200. No cached publication state.
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: (process.env.BLOG_MEDIA_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean).map(value => {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Invalid blog media origin configuration.');
      return { protocol: 'https', hostname: url.hostname, port: url.port, pathname: '/**' };
    }),
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin' },
      // Harden framing/plugins/base URLs without blocking Next's inline scripts,
      // authentication popups, analytics or the existing export libraries.
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
    ] }];
  },
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
