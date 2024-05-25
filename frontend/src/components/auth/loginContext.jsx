"use client";
import { useState, createContext, useContext } from "react";
import { postData } from "@/services/apiCalls";
import Cookies from "js-cookie";

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
	const [errors, setErrors] = useState({});

	const login = (endPoint, formData) => {
		postData(endPoint, formData)
			.then((res) => {
				if (res.status == 200 || res.status == 201) {
					setErrors({
						success: "Login Successful",
					});
				} else {
					setErrors({
						first_name: res.response.data.first_name,
						last_name: res.response.data.last_name,
						username: res.response.data.username,
						email: res.response.data.email,
						password: res.response.data.password,
						status: res.response.status,
						server_error:
							res.response.data + " " + res.response.status,
						error: res.response.data.error,
					});
				}
			})
			.catch((error) => {
				console.log("error happens==> ", error);
			});
	};
	return (
		<LoginContext.Provider value={{ errors, setErrors, login }}>
			{children}
		</LoginContext.Provider>
	);
};

export const useAuth = () => useContext(LoginContext);
