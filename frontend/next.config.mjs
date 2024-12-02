const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*', // Make sure to use the service name
      },
    ];
  },
};

export default nextConfig;