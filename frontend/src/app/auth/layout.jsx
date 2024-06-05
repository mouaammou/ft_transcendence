"use client";
import Login42 from "@/components/auth/Oauth/login42";
import { useAuth } from "@/components/auth/loginContext";

const LoginLayout = ({ children }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return (
			<>
				{children}
				<br />
				<Login42 />
			</>
		);
	} else return null;
};

export default LoginLayout;
