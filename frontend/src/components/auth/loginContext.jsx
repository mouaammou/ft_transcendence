"use client";
import { useState, createContext, useContext, useEffect } from "react";
import { postData } from "@/services/apiCalls";
import { useRouter, usePathname } from "next/navigation";
import { verifyToken } from "@/services/apiCalls";

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
	const router = useRouter();
	const [errors, setErrors] = useState({});
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [endPoint, setEndPoint] = useState("/login");

	const pathname = usePathname();

	const login = (endpoint, formData) => {
		postData(endpoint, formData)
			.then((res) => {
				if (res.status == 200 || res.status == 201) {
					setIsAuthenticated(true);
					setErrors({
						success: "Login Successful",
					});
				} else {
					if (res.response && res.response.status === 500) {
						router.push("/500");
					}
					if (endpoint === "/signup") {
						setEndPoint("/signup");
					} else setEndPoint("/login");
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
					console.log("logout error==> ", res);
				}
			}
		});
	};

	const checkAuth = () => {
		setIsAuthenticated(false);
		console.log("pathname==>", pathname);
		verifyToken("/token/verify").then((res) => {
			if (res != null && res.status === 200) {
				setIsAuthenticated(true);
				if (pathname === "/auth/login" || pathname === "/auth/signup")
					router.push("/profile");
				else router.push(pathname);
			} else {
				if (res.response.status === 500) {
					router.push("/500");
				} else {
					router.push(`/auth${endPoint}`);
				}
			}
		});
	};

	useEffect(() => {
		checkAuth();
	}, [errors]);

	return (
		<LoginContext.Provider
			value={{
				errors,
				setErrors,
				login,
				logout,
				isAuthenticated,
				setIsAuthenticated,
				endPoint,
				setEndPoint,
			}}
		>
			{children}
		</LoginContext.Provider>
	);
};

export const useAuth = () => useContext(LoginContext);
