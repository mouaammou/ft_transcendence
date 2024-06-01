import { getData } from "@/services/apiCalls";

const Login42 = () => {
	const handleLogin = async () => {
		await getData("/auth/login/42").then((res) => {
			if (res.status === 200) {
				console.log(res);
				window.location.href = res.data.auth_url;
			}
		});
	};

	return (
		<div>
			<h1>Login - Signup with 42</h1>
			<button onClick={handleLogin}>Login</button>
		</div>
	);
};

export default Login42;
