"use client";
import { useState, createContext, useContext, useEffect } from "react";
import { postData } from "@/services/apiCalls";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
	const router = useRouter();
	const [errors, setErrors] = useState({});
	const [isAuth, setIsAuth] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true)
		const isAuthValue = Cookies.get("isAuth");

			if (isAuthValue)
				setIsAuth(JSON.parse(isAuthValue));
	}, []);

	if (!mounted)
		return <>
			<body>
				
			</body>
		</>;

	const AuthenticateTo = (endpoint, formData) => {
		

		postData(endpoint, formData)
			.then((res) => {
				if (res.status == 200 || res.status == 201) {
					setIsAuth(true);
					console.log("Login successfully");
					setErrors({
						success: "Login Successful",
					});
					router.push("/profile")
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
				setIsAuth,
			}}
		>
			{children}
		</LoginContext.Provider>
	);
};

export const useAuth = () => useContext(LoginContext);
