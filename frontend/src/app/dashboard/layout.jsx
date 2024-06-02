"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/loginContext";

const Layout = ({ children }) => {
	const { isAuthenticated } = useAuth();
	if (isAuthenticated)
		return <>{children}</>;
	else
		return null;
};

export default Layout;
