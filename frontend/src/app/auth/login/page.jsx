"use client";
import { LoginContext } from "@/components/auth/loginContext";
import { useContext } from "react";
import LoginPage from "@/components/auth/login";
import { useRouter } from "next/navigation";

export default function MainPage() {
	const router = useRouter();
	const {errors} = useContext(LoginContext);
	if (errors.success) {
		router.push("/dashboard");
	}
  return (
	<div>
		<h1>Welcome to Login Page</h1>
		<LoginPage />
	</div>
  )
}
