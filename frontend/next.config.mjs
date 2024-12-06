const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // destination: 'http://backend:8000/:path*', // Make sure to use the service name
        destination: 'http://localhost:8000/:path*', // Make sure to use the service name
      },
    ];
  },
};

export default nextConfig;