"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/auth/logout";
import { verifyToken } from "@/services/apiCalls";

const Layout = ({ children }) => {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		verifyToken("/token/verify/").then((res) => {
			if (res.status === 200) {
				setIsAuthenticated(true);
			} else {
				setIsAuthenticated(false);
				router.push("/auth/login/");
			}
		});
	}, []);

	return (
		<>
			{isAuthenticated ? children : null}
			<Logout />
		</>
	);
};

export default Layout;
