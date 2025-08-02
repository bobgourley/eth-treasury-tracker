import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle redirects to prevent crawl errors
  async redirects() {
    return [
      // Redirect www to non-www for consistency
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.ethereumlist.com',
          },
        ],
        destination: 'https://ethereumlist.com/:path*',
        permanent: true,
      },
      // Handle old currency URLs that might be cached/indexed
      {
        source: '/currencies/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Improve SEO with trailing slash handling
  trailingSlash: false,
};

export default nextConfig;
