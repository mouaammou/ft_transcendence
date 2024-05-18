"use client";
import { useState } from "react";
import axios from "axios";

function Signup() {
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validateFrom = () => {
		const errors = {};
		setErrors(errors);

		//validate first name
		if (!formData.first_name.trim()) {
			//trim() removes whitespace from both ends of a string
			errors.first_name = "First name is required";
		} else if (formData.first_name.length < 3) {
			errors.first_name = "First name must be at least 3 characters";
		} else if (!/^[a-zA-Z]+$/.test(formData.first_name)) {
			errors.first_name = "First name must contain only letters";
		}

		//validate last name
		if (!formData.last_name.trim()) {
			errors.last_name = "Last name is required";
		} else if (formData.last_name.length < 3) {
			errors.last_name = "Last name must be at least 3 characters";
		} else if (!/^[a-zA-Z]+$/.test(formData.last_name)) {
			errors.last_name = "Last name must contain only letters";
		}
		//validate username
		if (!formData.username.trim()) {
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
		if (!formData.email.trim()) {
			errors.email = "Email is required";
		} else if (
			!/\S+@\S+\.\S+/.test(formData.email) ||
			formData.email.length < 10
		) {
			//this regex means that email must contain @ and .
			errors.email = "Email is invalid";
		}

		//validate password
		if (!formData.password.trim()) {
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
		if (!formData.confirmPassword.trim()) {
			errors.confirmPassword = "Confirm password is required";
		} else if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		return errors;
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const PostData = async (e) => {
		e.preventDefault();
		const forms_errors = validateFrom();
		if (Object.keys(forms_errors).length > 0) {
			setIsSubmitting(false);
			setErrors(forms_errors);
			return;
		}

		const { confirmPassword, ...dataToSend } = formData;
		//make a post request to the server
		await axios
			.post("/api/signup/", dataToSend, {
				"Content-Type": "application/json",
			})
			.then((res) => {
				//if the request is successful
				console.log("data==> ", res.data);
				setErrors({ success: "Account Created Successfully" });
				setIsSubmitting(true);
				//redirect to the login page
			})
			.catch((error) => {
				//if the request is not successful
				console.log("error ==> ", error);
				console.log("error.message ==> ", error.response.data);
				setErrors({
					message: error.response.data + " " + error.response.status,
					first_name: error.response.data.first_name,
					last_name: error.response.data.last_name,
					username: error.response.data.username,
					email: error.response.data.email,
					password: error.response.data.password,
				});
				setIsSubmitting(false);
			});
	};

	return (
		<div className="signup">
			<h1>sign up</h1>
			<form onSubmit={PostData} method="POST">
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
				<button type="submit">
					{isSubmitting ? "Submitting..." : "Sign up"}
				</button>
				<br />
				{
					<div>
						{<p>{errors.success}</p>}
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
							errors.message && <p>{errors.message}</p>}
					</div>
				}
			</form>
		</div>
	);
}

export default Signup;
