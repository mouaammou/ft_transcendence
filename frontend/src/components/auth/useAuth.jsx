"use client";

import { useAuth } from "@/components/auth/loginContext";
import { useEffect } from "react";

const ClientAuth = () => {
	const { checkAuth, errors } = useAuth();

	useEffect(() => {
		checkAuth();
	}, [errors]);

	return null;
};

export default ClientAuth;
