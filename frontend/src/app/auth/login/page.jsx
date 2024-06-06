"use client";
import { useAuth } from "@/components/auth/loginContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Login42 from "@/components/auth/Oauth/login42";
import "@styles/auth/login.css";

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
		<div className="login-main-container">
			<form onSubmit={signIn} className="main-login">
				<p>Join</p>
				<input
					type="text"
					className="form-control"
					name="username"
					placeholder="Enter Your Username"
					onChange={handleChange}
				/>
				<input
					type="password"
					className="form-control"
					name="password"
					placeholder="Enter Your Password"
					onChange={handleChange}
				/>
				<button type="submit" className="btn btn-primary">
					Login
				</button>
				<img
					src="/login-with.svg"
					alt="login-with"
					className="sign-with"
				/>
				<div className="logos">
					<Login42 />
					<img
						src="/google-icon.png"
						alt=""
						className="google-logo"
					/>
				</div>
				<div className="forgot-password">
					<a href="">Forgot your password?</a>
					<div className="have-no-account">
						Don't have an account?
						<Link rel="stylesheet" href="/auth/signup">
							Sign up
						</Link>
					</div>
				</div>
				<br />
				{
					<p className="text-danger">
						{errors.error ? errors.error : errors.server_error}
					</p>
				}
			</form>
			<div className="side-image">
				<img className="sign-with" src="/login.svg" alt="welcome" width="150%"/>
			</div>
		</div>
	);
}
