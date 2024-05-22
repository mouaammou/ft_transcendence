import { LoginProvider } from "../components/auth/loginContext";

function MyApp({ Component, pageProps }) {
	return (
		<LoginProvider>
			<Component {...pageProps} />
		</LoginProvider>
	);
}

export default MyApp;
