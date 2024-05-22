"use client";
import { LoginContext } from "@/components/auth/loginContext";
import { useContext, useState } from "react";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const { errors, login, isSubmitting } = useContext(LoginContext);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await login("/api/login/", formData);
	};

	return (
		<div className="login">
			<form onSubmit={handleSubmit}>
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
					{isSubmitting ? "Loading..." : "Login"}
				</button>
				<br />
				{
					<p className="text-danger">
						{!(errors.success ? errors.success : errors.error)
							? errors.server_error
							: errors.success
							? errors.success
							: errors.error}
					</p>
				}
			</form>
		</div>
	);
}
