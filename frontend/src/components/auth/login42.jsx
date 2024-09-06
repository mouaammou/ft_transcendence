"use client";
import { getData } from "@/services/apiCalls";

const Login42 = () => {
	const handleLogin = async () => {
		getData("/auth/login/42").then((res) => {
			if (typeof window !== 'undefined' &&  res.status === 200) {
				console.log(res);
				window.location.href = res.data.auth_url;
			}
		});
	};

	return (
		<img src="/g3.svg" alt="" className="_42-logo" onClick={handleLogin} />
	);
};

export default Login42; 
