"use client";
import { useRouter } from "next/navigation";
import { verifyToken } from "@/services/apiCalls";
import { useEffect } from "react";

const Layout = ({ children }) => {
	const router = useRouter();
	useEffect(() => {
		verifyToken("/token/verify/").then((res) => {
			if (res.status === 200) {
				router.push("/dashboard/");
			}
		});
	}, []);

	return <>{children}</>;
};

export default Layout;
