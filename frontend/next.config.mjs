/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	trailingSlash: false,
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:8000/:path*",
			},
		];
	},
};

export default nextConfig;
