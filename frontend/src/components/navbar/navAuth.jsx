"use client";
import Link from "next/link";
import { useAuth } from "@/components/auth/loginContext";
import Links from "./Links/Links";

const Navbar = () => {
	const { isAuthenticated, logout } = useAuth();

	return (
		<nav className="navbar">
			<div className="logo">
				<img src="/logo.svg" alt="logo" />
			</div>
			{isAuthenticated ? (
				<>
					<Links />
					<div className="union">
						<img src="/Union.svg" alt="union" />
					</div>
					<div>
						<img src="/logout.svg" alt="logout" onClick={logout} />
					</div>
					<div className="logout-text">LOGOUT</div>
				</>
			) : (
				<>
					<div className="sign-in">
						<Link href="/auth/login" className="login">
							Login
						</Link>
						&nbsp;|&nbsp;
						<Link href="/auth/signup" className="sign-up">
							Signup
						</Link>
					</div>
				</>
			)}
		</nav>
	);
};

export default Navbar;
