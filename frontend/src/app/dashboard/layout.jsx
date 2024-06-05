"use client";
import { useAuth } from "@/components/auth/loginContext";
import { useRouter } from "next/navigation";

const Layout = ({ children }) => {

	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return null;
	} else
		return <>{children}</>;
};

export default Layout;
