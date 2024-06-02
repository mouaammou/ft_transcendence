"use client";
import Login42 from "@/components/auth/Oauth/login42";

const Layout = ({ children }) => {
	return (
		<>
			{children}
			<br />
			<Login42 />
		</>
	);
};

export default Layout;
