"use client";
import { useState, createContext, useContext, useEffect } from "react";
import { postData } from "@/services/apiCalls";
import { useRouter } from "next/navigation";

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
	const router = useRouter();
	const [errors, setErrors] = useState({});
	const [isAuth, setIsAuth] = useState(false)

	useEffect(() => {
		const isAuthValue = localStorage.getItem("isAuth");
		if (isAuthValue)
			setIsAuth(JSON.parse(isAuthValue));
	}, [])

	const AuthenticateTo = (endpoint, formData) => {

		setIsAuth(true)
		localStorage.setItem("isAuth", JSON.stringify(true));

		postData(endpoint, formData)
			.then((res) => {
				if (res.status == 200 || res.status == 201) {
					console.log("Login successfully");
					setErrors({
						success: "Login Successful",
					});
				} else {
					if (res.response && res.response.status === 500) {
						router.push("/500");
					}
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

	const Logout = () => {
		setIsAuth(false);
		localStorage.setItem("isAuth", JSON.stringify(false));

		postData("/logout").then((res) => {
			if (res && res.status === 205) {
				router.push("/login");
			}
		});
	};

	return (
		<LoginContext.Provider
			value={{
				errors,
				setErrors,
				AuthenticateTo,
				Logout,
				isAuth,
				setIsAuth
			}}
		>
			{children}
		</LoginContext.Provider>
	);
};

export const useAuth = () => useContext(LoginContext);
