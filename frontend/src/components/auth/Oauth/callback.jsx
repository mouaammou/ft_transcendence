import { useEffect } from "react";
import { useRouter } from "next/router";
import { getData } from "@/services/apiCalls";

const AuthCallback = () => {
	const router = useRouter();

	useEffect(() => {
		const fetchTokens = async () => {
			try {
				const response = await getData("/auth/callback/42/");
				if (response.status === 200) {
					// Tokens are set in cookies by the backend
					router.push("/dashboard");
				}
			} catch (error) {
				console.error("Error completing login:", error);
				router.push("/login");
			}
		};

		fetchTokens();
	}, [router]);

	return <div>Loading...</div>;
};

export default AuthCallback;
