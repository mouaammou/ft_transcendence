const nextConfig = {
  reactStrictMode: false,
  async rewrites() {

    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PRIVATE_BACKEND_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;