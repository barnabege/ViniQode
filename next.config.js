// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      // Pages e-label canoniques /elabel/[lang]/[id] : caching long, noindex.
      {
        source: "/elabel/:lang/:id",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=600" },
        ],
      },
      // Forme legacy /elabel/[id] (QR codes existants) : redirigée par
      // middleware vers la forme canonique. Cette redirection dépend de
      // l'Accept-Language du consommateur — pas de cache CDN partagé.
      {
        source: "/elabel/:id",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
