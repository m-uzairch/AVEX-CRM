import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@avex/types', '@avex/constants', '@avex/database'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: '/invoices/recurring',
        destination: '/invoices?tab=recurring',
        permanent: true,
      },
      {
        source: '/payments',
        destination: '/finance?tab=payments',
        permanent: true,
      },
      {
        source: '/expenses',
        destination: '/finance?tab=expenses',
        permanent: true,
      },
      {
        source: '/taxes',
        destination: '/finance?tab=taxes',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
