const Login42 = () => {
	const handleLogin = () => {
		window.location.href = "http://localhost:8000/auth/login/42/";
	};

	return (
		<div>
			<h1>Login with 42</h1>
			<button onClick={handleLogin}>Login</button>
		</div>
	);
};

export default Login42;
