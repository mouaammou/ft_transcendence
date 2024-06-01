"use client";
import { useState, createContext, useContext } from "react";
import { postData } from "@/services/apiCalls";
import { useRouter } from "next/navigation";
import { verifyToken } from "@/services/apiCalls";

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
	const router = useRouter();
	const [errors, setErrors] = useState({});
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const login = (endPoint, formData) => {
		postData(endPoint, formData)
			.then((res) => {
				if (res.status == 200 || res.status == 201) {
					setErrors({
						success: "Login Successful",
					});
					setIsAuthenticated(true);
				} else {
					if (res.response.status === 500) {
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

	const logout = () => {
		postData("/logout").then((res) => {
			if (res && res.status === 205) {
				setIsAuthenticated(false);
				router.push("/auth/login");
			} else {
				if (res.response.status === 500) {
					router.push("/500");
				} else {
					setIsAuthenticated(true);
					console.log("logout error==> ", res);
				}
			}
		});
	};

	const checkAuth = () => {
		verifyToken("/token/verify").then((res) => {
			if (res != null && res.status === 200) {
				setIsAuthenticated(true);
				router.push("/dashboard");
			} else {
				if (res.response.status === 500) {
					router.push("/500");
				} else {
					setIsAuthenticated(false);
					router.push("/auth/login");
				}
			}
		});
	};

	return (
		<LoginContext.Provider
			value={{
				errors,
				setErrors,
				login,
				logout,
				isAuthenticated,
				setIsAuthenticated,
				checkAuth,
			}}
		>
			{children}
		</LoginContext.Provider>
	);
};

export const useAuth = () => useContext(LoginContext);
