// pages/dashboard/route.js
"use client";
import { useContext, useEffect } from "react";
// import { useRouter } from "next/navigation";

import { LoginContext } from "../../components/auth/authContext";
import Login from "../../components/auth/Login";

export default function GET() {
	const router = useRouter();
	const { errors } = useContext(LoginContext);

	useEffect(() => {
		if (errors.success) {
			//render
			console.log("Login Successful");
		}
	}, [errors, router]);

	return (
		<div>
			<Login />
		</div>
	);
}
