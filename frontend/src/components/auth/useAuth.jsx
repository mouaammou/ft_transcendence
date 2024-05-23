"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const useAuth = (url) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	async function verifyAuth() {
		try {
			const response = await axios.post(url, {
				withCredentials: true,
			});
			console.log(response);
			if (response.status === 200) {
				setIsAuthenticated(true);
			}
		} catch (error) {
			console.error(error);
			setIsAuthenticated(false);
		}
	}
	verifyAuth();
	return isAuthenticated;
};

export default useAuth;
