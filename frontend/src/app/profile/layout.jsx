"use client";
import { useAuth } from "@/components/auth/loginContext";

const Layout = ({ children }) => {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) return <>{children}</>;
};

export default Layout;
