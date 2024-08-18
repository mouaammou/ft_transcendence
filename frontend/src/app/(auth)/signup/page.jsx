"use client";
import { useState } from "react";
import { useAuth } from "@loginContext/loginContext";
import Login42 from "@components/auth/login42";
import "../../../Styles/auth/signup.css";

function Signup() {
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { errors, AuthenticateTo } = useAuth();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const singUp = async (e) => {
		e.preventDefault();
		await AuthenticateTo("/signup", formData);
	};

	return (
		<div className="main-container">
			<form onSubmit={singUp} method="POST" className="main-login">
				<p>Sing Up</p>
				<div className="first-last-names">
					<input
						type="text"
						placeholder="first name"
						name="first_name"
						required
						onChange={handleChange}
					/>
					<input
						type="text"
						placeholder="last name"
						name="last_name"
						required
						onChange={handleChange}
					/>
				</div>
				<input
					type="text"
					placeholder="username"
					name="username"
					required
					onChange={handleChange}
				/>
				<input
					type="email"
					placeholder="email"
					name="email"
					required
					onChange={handleChange}
				/>
				<input
					type="password"
					placeholder="password"
					name="password"
					required
					onChange={handleChange}
				/>
				<input
					type="password"
					placeholder="confirm password"
					name="confirmPassword"
					required
					onChange={handleChange}
				/>
				<button type="submit">Sign up</button>
				<img
					src="/login-with.svg"
					alt="login-with"
					className="sign-wit"
				/>
				<div className="logos">
					<Login42 />
					<img
						src="/google-icon.png"
						alt="dfds"
						className="google-logo"
					/>
				</div>
				<br />
				{
					<div>
						{<p>{errors.first_name}</p>}
						{<p>{errors.last_name}</p>}
						{<p>{errors.username}</p>}
						{<p>{errors.email}</p>}
						{<p>{errors.password}</p>}
						{<p>{errors.confirmPassword}</p>}
						{/* display message only if all errors not  */}
						{!errors.first_name &&
							!errors.last_name &&
							!errors.username &&
							!errors.email &&
							!errors.password &&
							!errors.confirmPassword &&
							errors.server_error && <p>{errors.server_error}</p>}
					</div>
				}
			</form>
			<div className="side-image">
				<img
					className="sign-with"
					src="/login-pane.svg"
					alt="welcome"
				/>
			</div>
		</div>
	);
}

export default Signup;
