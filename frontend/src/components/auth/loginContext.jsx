"use client";
import { useState, createContext, useContext, useEffect } from "react";
import { postData } from "@/services/apiCalls";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { usePathname } from 'next/navigation';

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
	const router = useRouter();
	const [errors, setErrors] = useState({});
	const initialAuthState = typeof window !== 'undefined' ? JSON.parse(Cookies.get("isAuth") || 'false') : false;
	const [isAuth, setIsAuth] = useState(initialAuthState);
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname()

	useEffect(() => {
		const isAuthValue = Cookies.get("isAuth");
		if (isAuthValue)
			setIsAuth(JSON.parse(isAuthValue));
		else
		{
			setIsAuth(false)
			Cookies.set("isAuth", false, {path: "/"});
			router.push("/login")
		}
		setMounted(true)
	}, [pathname]);
	
	const AuthenticateTo = (endpoint, formData) => {
		postData(endpoint, formData)
			.then((res) => {
				if (res.status == 200 || res.status == 201) {
					setIsAuth(true);
					Cookies.set("isAuth", true);
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
		Cookies.remove("isAuth");
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
			{mounted && children}
		</LoginContext.Provider>
	);
};

export const useAuth = () => useContext(LoginContext);
