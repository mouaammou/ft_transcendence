"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginContext } from "@/components/auth/loginContext";

export default function Dash() {
	const router = useRouter();
	const { errors } = useContext(LoginContext);

	if (!errors.success) {
		router.push("/auth/login");
		return null;
	}

	return (
		<div>
			<h1>Welcome to Dashboard</h1>
			<h2>Protected Route</h2>
		</div>
	);
}
