"use client";
import { postData } from "@/services/apiCalls";
import { useRouter } from "next/navigation";
export default function Logout() {
	const router = useRouter();

	const logout = () => {
		postData("/logout/").then((res) => {
			if (res && res.status === 205) {
				router.push("/auth/login/");
			} else {
				console.log("logout error==> ", res);
			}
		});
	};

	return <button onClick={logout}>Logout</button>;
}
