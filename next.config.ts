import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // All pages are fully client-side ("use client" + TanStack Query + useSearchParams).
    // They cannot produce a server-rendered static shell, so we switch validation to
    // manual-warning: the overlay fires only for segments that explicitly export
    // `instant = true`, not for every page automatically.
    // See: node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
