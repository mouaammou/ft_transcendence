"use client";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { LoginProvider } from "@components/auth/loginContext";
import Navbar from "@/components/navbar/navAuth";

const inter = Inter({ subsets: ["latin"] });
// import "@/Styles/navbar/navbar.css";


// export const metadata = {
// 	title: "Transcendence",
// 	description:
// 		"Transcendence is a web application that allows users to create and manage their own personal blogs.",
// };

export default function RootLayout({ children }) {

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
				<body>
					{/* <div className="container"> */}
						<Navbar />
						{children}
						<div className="footer"></div>
					{/* </div> */}
				</body>
			</LoginProvider>
		</html>
	);
}
