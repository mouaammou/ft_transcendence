"use client";
import { useAuth } from "@/components/auth/loginContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const { errors, login, setErrors } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const signIn = async (e) => {
		setIsSubmitting(true);
		e.preventDefault();
		await login("login/", formData);
		setIsSubmitting(false);
	};

	useEffect(() => {
		if (errors.success) {
			router.push("/dashboard/");
		}
		setErrors({});
	}, [errors.success]);

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
