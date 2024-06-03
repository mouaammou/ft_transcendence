"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./loginContext";

function Signup() {
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const { errors, login, setErrors, endPoint, setEndPoint } = useAuth();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const singUp = async (e) => {
		e.preventDefault();
		await login("/signup", formData);
	};

	useEffect(() => {
		if (endPoint === "/login") {
			setEndPoint("/signup");
			setErrors({});
		}
	}, []);

	return (
		<div className="signup">
			<h1>sign up</h1>
			<form onSubmit={singUp} method="POST">
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
		</div>
	);
}

export default Signup;
