const nextConfig = {
  reactStrictMode: false, // Set to true for stricter checks (optional)
  // swcMinify: true, // Use SWC for minification
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*', // Proxies requests to localhost:8000
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Use 'http' for localhost
        hostname: 'localhost', // Hostname
        port: '8000', // Port number
        pathname: '/media/avatars/**', // Allow any file in this path
      },
    ],
  },
};

export default nextConfig;
