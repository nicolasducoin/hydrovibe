/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/searchparams',
        destination: 'http://localhost:8080/searchparams',
      },
    ];
  },
};

module.exports = nextConfig;
