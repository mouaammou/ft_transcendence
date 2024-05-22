
import { LoginProvider } from "../components/auth/authContext";

function MyApp({ Component, pageProps }) {
	return (
		<LoginProvider>
			<Component {...pageProps} />
		</LoginProvider>
	);
}

export default MyApp;
