/** @type {import('next').NextConfig} */
const isProd = true; // Just change this to true when you want production settings

const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    if (isProd) {
      config.module.rules.push({
        test: /\.css$/i,
        use: [
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
        ],
      });
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://backend:8000/:path*',
      },
    ];
  },
};

export default nextConfig;