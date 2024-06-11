"use client";
import { Inter } from "next/font/google";
import { LoginProvider } from "@components/auth/loginContext";
import Navbar from "@/components/navbar/navAuth";
// add
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/sidebar/sidebar";
//
const inter = Inter({ subsets: ["latin"] });
import "@/styles/globals.css";


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
			<LoginProvider>
				{/* <body className={inter.className}> */}
				<body className={`${inter.className} ${isChatPage ? 'style-chat' : ''}`}>

					{isChatPage ? <Sidebar /> : <Navbar />}
					{children}
				</body>
			</LoginProvider>
		</html>
	);
}
