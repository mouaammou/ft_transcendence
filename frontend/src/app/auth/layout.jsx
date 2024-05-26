"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/loginContext";

const Layout = ({ children }) => {
	const { checkAuth } = useAuth();

	useEffect(() => {
		checkAuth();
	}, []);

	return <>{children}</>;
};

export default Layout;
