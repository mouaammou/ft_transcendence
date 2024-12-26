const nextConfig = {
  reactStrictMode: false,
  async rewrites() {

    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PRIVATE_BACKEND_API_URL}/:path*`, // Make sure to use the service name
        // destination: 'http://localhost:8000/:path*', // Make sure to use the service name
      },
    ];
  },
};

export default nextConfig;