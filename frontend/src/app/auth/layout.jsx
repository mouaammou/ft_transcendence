"use client";
import { useAuth } from "@/components/auth/loginContext";

const LoginLayout = ({ children }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <>{children}</>;
	}
};

export default LoginLayout;
