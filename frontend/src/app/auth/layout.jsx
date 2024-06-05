"use client";
import { useAuth } from "@/components/auth/loginContext";

const LoginLayout = ({ children }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return (
			<>
				{children}
			</>
		);
	} else return null;
};

export default LoginLayout;
