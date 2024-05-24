"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { postData, verifyToken } from "@/services/apiCalls";

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

	const logout = async () => {
		const response = await postData("logout/");
		if (response.status === 205) {
			router.push("/auth/login/");
			Cookies.remove("access_token");
			Cookies.remove("refresh_token");
			Cookies.remove("username");
		}
	};

	return (
		<>
			{isAuthenticated ? children : null}
			<button type="button" onClick={logout}>
				Logout
			</button>
		</>
	);
};

export default Layout;
