"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/loginContext";
import Login42 from "@/components/auth/Oauth/login42";

const Layout = ({ children }) => {
	const { checkAuth } = useAuth();

	useEffect(() => {
		checkAuth();
	}, []);

	return (
		<>
			{children}
			<br />
			<Login42 />
		</>
	);
};

export default Layout;
