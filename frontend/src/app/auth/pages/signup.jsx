"use client";

import { useState } from "react";
import axios from "axios";

function Signup() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState({});

	const validateFrom = () => {
		const errors = {};
		setErrors(errors);

		//validate username
		if (!formData.username) {
			errors.username = "Username is required";
		} else if (
			formData.username.length < 5 ||
			formData.username.length > 20
		) {
			errors.username = "Username must be between 5 and 20 characters";
		} else if (!/^[a-zA-Z]+$/.test(formData.username)) {
			//must username contain only letters;
			errors.username = "Username must contain only letters";
		}

		//validate email
		if (!formData.email) {
			errors.email = "Email is required";
		} else if (
			!/\S+@\S+\.\S+/.test(formData.email) ||
			formData.email.length < 10
		) {
			//this regex means that email must contain @ and .
			errors.email = "Email is invalid";
		}

		//validate password
		if (!formData.password) {
			errors.password = "Password is required";
		} else if (formData.password.length < 8) {
			errors.password = "Password must be at least 8 characters";
		} else if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(
				formData.password
			)
		) {
			errors.password =
				"Password must contain at least one uppercase letter, one lowercase letter and one number";
		}

		//validate confirmPassword
		if (!formData.confirmPassword) {
			errors.confirmPassword = "Confirm password is required";
		} else if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		setErrors(errors);
	};

	const PostData = async (e) => {
		e.preventDefault();
		validateFrom();
		const errors = {};
		setErrors(errors);
		if (Object.keys(errors).length > 0) {
			return;
		}

		const { confirmPassword, ...dataToSend } = formData;
		//make a post request to the server
		await axios
			.post(
				"/api/signup/",
				dataToSend,
				(headers = {
					"Content-Type": "application/json",
				})
			)
			.then((res) => {
				//if the request is successful
				console.log("data==> ", res.data);
			})
			.catch((error) => {
				//if the request is not successful
				console.log("error ==> ", error);
				console.log("username: ", error.response.data.username);
				error.response.data.username;
				error.response.data.email;
				error.response.data.password;

				setErrors({
					username: error.response.data.username,
					email: error.response.data.email,
					password: error.response.data.password,
				});
			});
	};

	return (
		<div className="signup">
			<h1>sign up</h1>
			<form onSubmit={PostData} method="POST">
				<input
					type="text"
					placeholder="username"
					name="username"
					required
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					type="email"
					placeholder="email"
					name="email"
					required
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type="password"
					placeholder="password"
					name="password"
					required
					onChange={(e) => setPassword(e.target.value)}
				/>
				<input
					type="password"
					placeholder="confirm password"
					name="confirmPassword"
					required
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
				<button type="submit">submit</button>
				<br />
				{errors && (
					<div>
						{errors.username && <p>{errors.username}</p>}
						{errors.email && <p>{errors.email}</p>}
						{errors.password && <p>{errors.password}</p>}
						{errors.confirmPassword && <p>{errors.confirmPassword}</p>}
					</div>
				)}
			</form>
		</div>
	);
}

export default Signup;
