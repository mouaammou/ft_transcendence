"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const Layout = ({ children }) => {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const verifyAuth = useCallback(async () => {
		try {
			const response = await axios.post("/api/token/verify/", {
				withCredentials: true,
			});
			if (response.status === 200) {
				setIsAuthenticated(true);
			}
		} catch (error) {
			setIsAuthenticated(false);
		}
	}, [router]);

	useEffect(() => {
		verifyAuth();

		const interval = setInterval(verifyAuth, 3000); // 5 seconds

		return () => {
			clearInterval(interval);
			setIsAuthenticated(false);
		};
	}, [verifyAuth]);

	if (isAuthenticated) {
		router.push("/dashboard/");
	} else {
		return <>{children}</>;
	}
};

export default Layout;
