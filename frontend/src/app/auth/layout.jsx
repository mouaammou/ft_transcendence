"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/loginContext";

const Layout = ({ children }) => {
	const { checkAuth, isAuthenticated } = useAuth();

	 console.log("isAuthenticated: ", isAuthenticated);
	 useEffect(() => {
		checkAuth();
	}, [isAuthenticated]);

	return <>{children}</>;
};

export default Layout;
