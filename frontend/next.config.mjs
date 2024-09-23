// /** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:8000/:path*",
			},
		];
	},
	// server: {
	// 	host: '0.0.0.0'`
	// }
};

export default nextConfig

