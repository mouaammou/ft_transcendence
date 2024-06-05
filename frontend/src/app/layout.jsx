"use client";
import { Inter } from "next/font/google";
import { LoginProvider } from "@components/auth/loginContext";
import Navbar from "@/components/navbar/navAuth";

const inter = Inter({ subsets: ["latin"] });
// import "@/styles/globals.css";

// export const metadata = {
// 	title: "Transcendence",
// 	description:
// 		"Transcendence is a web application that allows users to create and manage their own personal blogs.",
// };

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<LoginProvider>
				<body className={inter.className}>
					<Navbar />
					{children}
				</body>
			</LoginProvider>
		</html>
	);
}
