import { Inter } from "next/font/google";
import { LoginProvider } from "@components/auth/loginContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Transcendence",
	description: "Transcendence is a web application that allows users to create and manage their own personal blogs.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<LoginProvider>
				<body className={inter.className}>{children}</body>
			</LoginProvider>
		</html>
	);
}
