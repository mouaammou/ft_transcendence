import { postData } from "@/services/apiCalls";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Logout() {
	const router = useRouter();
	const logout = async () => {
		const response = await postData("logout/");
		if (response.status === 205) {
			Cookies.remove("access_token");
			Cookies.remove("refresh_token");
			Cookies.remove("username");
			router.push("/auth/login/");
		}
	};

	return <button onClick={logout}>Logout</button>;
}
