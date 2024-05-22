"use client";
import { useState, createContext } from "react";
import axios from "axios";

export const LoginContext = createContext(null);

export const LoginProvider = ({children}) => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post("/api/login/", formData, {
				"Content-Type": "application/json",
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
	};

	return (
		<LoginContext.Provider
			value={{ formData, errors, handleChange, handleSubmit }}>
			{children}
		</LoginContext.Provider>
	);
};
