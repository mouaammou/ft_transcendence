"use client";
import { LoginContext } from "@/components/auth/login";
import { useContext } from "react";

export default function LoginPage() {
	const {errors} = useContext(LoginContext);
	if (errors.success) {
		return (
			<div>
				<h1>Welcome to Login Page</h1>
				<p>{errors.success}</p>
			</div>
		);
	}
  return (
	<div>
		<h1>Welcome to Login Page</h1>
	</div>
  )
}
