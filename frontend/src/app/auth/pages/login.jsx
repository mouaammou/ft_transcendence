"use client";
import { useState } from "react";
import axios from "axios";

const Login = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const checkData = async (e) => {
		e.preventDefault();

		setIsSubmitting(true);
		try {
			const response = await axios.post("/api/token/verify/", formData, {
				withCredentials: true,
			});
			const data = response.data;
			console.log(data);
			setErrors({
				success: "Login Successful",
			});
		} catch (error) {
			console.log(error.response.data.error);
			console.log(error.response.data + " " + error.response.status);
			setErrors({
				error: error.response.data.error,
				sever_error: error.response.data + " " + error.response.status,
			});
		}
		setIsSubmitting(false);
	};

	return (
		<div className="login">
			<form onSubmit={checkData}>
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
							? errors.sever_error
							: errors.success
							? errors.success
							: errors.error}
					</p>
				}
			</form>
		</div>
	);
};

export default Login;
