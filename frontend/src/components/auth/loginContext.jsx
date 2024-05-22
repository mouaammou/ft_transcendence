"use client";
import { useState, createContext } from "react";
import axios from "axios";

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const login = async (url, formData) => {
		setIsSubmitting(true);
		try {
			const response = await axios.post(url, formData, {
				"Content-Type": "application/json",
			});

			console.log("data==> ", response);

			setErrors({
				success: "Login Successful",
			});
		} catch (error) {
			setErrors({
				first_name: error.response.data.first_name,
				last_name: error.response.data.last_name,
				username: error.response.data.username,
				email: error.response.data.email,
				password: error.response.data.password,
				status: error.response.status,
				server_error: error.response.data + " " + error.response.status,
				error: error.response.data.error,
			});
			console.log("error ==> ", error.response.data);
		}
		setIsSubmitting(false);
	};

	return (
		<LoginContext.Provider value={{ errors, setErrors, login, isSubmitting }}>
			{children}
		</LoginContext.Provider>
	);
};
