"use client";
import Login42 from "@/components/auth/Oauth/login42";
import { useAuth } from "@/components/auth/loginContext";

const Layout = ({ children }) => {
	const { isAuthenticated } = useAuth();

	// useEffect(() => {
	// 	checkAuth();
	// }, []);

	if (!isAuthenticated)
		return (
			<>
				{children}
				<br />
				<Login42 />
			</>
		);
	else return null;
};

export default Layout;
