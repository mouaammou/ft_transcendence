"use client";
import "@/Styles/globals.css";
import { Inter } from "next/font/google";
import { LoginProvider } from "@components/auth/loginContext";
import Navbar from "@/components/navbar/navAuth";
// add
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/sidebar/sidebar";
//
const inter = Inter({ subsets: ["latin"] });
// import "@/Styles/navbar/navbar.css";


// export const metadata = {
// 	title: "Transcendence",
// 	description:
// 		"Transcendence is a web application that allows users to create and manage their own personal blogs.",
// };

export default function RootLayout({ children }) {
	// add
	const pathname = usePathname();
	const isChatPage = pathname === '/chat';
	//
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
			</head>
			<LoginProvider>
				{/* <body className={`${inter.className} ${isChatPage ? 'style-chat' : ''}`}> */}
				<body className={inter.className}>
					{isChatPage ? (
						<div className="content">
							<Sidebar />
							{children}
						</div>
					) : (
						<>
							<Navbar />
							{children}
						</>
					)}
				</body>
			</LoginProvider>
		</html>
	);
}
