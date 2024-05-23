"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Layout = ({ children }) => {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const verifyAuth = useCallback(async () => {
		try {
			const response = await axios.post("/api/token/verify/", {
				withCredentials: true,
			});
			console.log(response);
			if (response.status === 200) {
				setIsAuthenticated(true);
			}
		} catch (error) {
			console.error(error);
			setIsAuthenticated(false);
			router.push("/auth/login/");
			return null;
		}
	}, [router]);

	useEffect(() => {
		//run this just one time
		if (!isAuthenticated) {
			verifyAuth();
		}

		const interval = setInterval(verifyAuth, 3000); // 5 seconds

		return () => {
			clearInterval(interval);
			setIsAuthenticated(false);
		};
	}, [verifyAuth]);

	const logout = async () => {
		try {
			const res = await axios.post("/api/logout/", {
				withCredentials: true,
			});
			if (res.status === 200) {
				Cookies.remove("refresh_token");
				Cookies.remove("access_token");
				Cookies.remove("username");
				setIsAuthenticated(false);
				router.push("/auth/login/");
				return null;
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			{isAuthenticated ? children : null}
			<button type="submit" onClick={logout}>
				Logout
			</button>
		</>
	);
};

export default Layout;
