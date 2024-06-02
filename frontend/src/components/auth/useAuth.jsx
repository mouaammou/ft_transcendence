"use client";

import { useAuth } from "@/components/auth/loginContext";
import { useEffect, useRef } from "react";

const ClientAuth = () => {
	const { checkAuth } = useAuth();
	// const hasRun = useRef(false);

	useEffect(() => {
		// if (!hasRun.current) {
			checkAuth();
			// hasRun.current = true;
		// }
	}, [checkAuth]);

	return null; // This component doesn't render anything visible
};

export default ClientAuth;
