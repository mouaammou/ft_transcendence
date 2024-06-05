"use client";
import { useAuth } from "@/components/auth/loginContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const router = useRouter();
	const { errors, login, endPoint, setErrors, setEndPoint, isAuthenticated } =
		useAuth();
	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const signIn = async (e) => {
		e.preventDefault();
		await login("/login", formData);
	};

	useEffect(() => {
		if (endPoint === "/signup") {
			setEndPoint("/login");
			setErrors({});
		}
		if (isAuthenticated) {
			router.push("/dashboard");
		}
	}, [isAuthenticated]);

	return (
		<div className="login">
			<form onSubmit={signIn}>
				<div className="form-group">
					<label htmlFor="username">Username</label>
					<input
						type="text"
						className="form-control"
						name="username"
						onChange={handleChange}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="password">Password</label>
					<input
						type="password"
						className="form-control"
						name="password"
						onChange={handleChange}
					/>
				</div>
				<button type="submit" className="btn btn-primary">
					Login
				</button>
				<br />
				{
					<p className="text-danger">
						{errors.error ? errors.error : errors.server_error}
					</p>
				}
			</form>
		</div>
	);
}
