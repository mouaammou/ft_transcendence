"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/loginContext";

const Navbar = () => {
	const { isAuthenticated, logout } = useAuth();

	return (
		<div>
			<nav>
				{isAuthenticated ? (
					<>
						<Link href="/dashboard">Dashboard</Link>
						&nbsp;|&nbsp;
						<Link href="/">HOME</Link>
						&nbsp;|&nbsp;
						<button onClick={logout}>Logout</button>
					</>
				) : (
					<>
						<Link href="/auth/login">Login</Link>
						&nbsp;|&nbsp;
						<Link href="/auth/signup">Signup</Link>
					</>
				)}
			</nav>
		</div>
	);
};

export default Navbar;
