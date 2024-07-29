"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getData } from "@/services/apiCalls";
import { useAuth } from "@/components/auth/loginContext";

const AuthCallback = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const { setIsAuthenticated } = useAuth();

	useEffect(() => {
		const fetchTokens = async () => {
			await getData(`auth/callback/42?code=${code}`)
				.then((response) => {
					setIsAuthenticated(false);
					if (response.status === 200 || response.status === 201) {
						setIsAuthenticated(true);
						router.push("/profile");
					}
				})
				.catch((error) => {
					console.log("Error:", error);
				});
		};
		fetchTokens();
	}, []);

	return <div>Loading...callback 42</div>;
};

export default AuthCallback;
