const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*', // Proxies requests to localhost:8000
      },
    ];
  },
  // images: {
  //   domains: ['localhost'],  // Allow localhost as a valid domain for images
  // },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'http',
  //       hostname: 'localhost', // Host where the images are served
  //       port: '8000',           // Django is running on port 8000
  //       pathname: '/media/avatars/**',  // Path to images
  //     },
  //   ],
  // },
};

export default nextConfig;
