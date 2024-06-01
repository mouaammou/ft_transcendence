"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getData } from "@/services/apiCalls";

const AuthCallback = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const code = searchParams.get("code");

	useEffect(() => {
		const fetchTokens = async () => {
			await getData(`auth/callback/42?code=${code}`)
				.then((response) => {
					if (response.status === 200 || response.status === 201) {
						console.log("Response status:", response.status);
						console.log("Response data:", response);
						console.log("Login successful");
						console.log("code code :: ", code);
						// Tokens are set in cookies by the backend
						router.push("/dashboard");
					}
				})
				.catch((error) => {
					console.log("Error:", error);
				});
		};
		if (code) fetchTokens();
	}, [code]);

	return <div>Loading...</div>;
};

export default AuthCallback;
