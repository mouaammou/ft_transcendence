"use client";
import { useAuth } from "@/components/auth/loginContext";
import { useState } from "react";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const { errors, login } = useAuth();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const signIn = async (e) => {
		e.preventDefault();
		await login("/login/", formData);
	};

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
