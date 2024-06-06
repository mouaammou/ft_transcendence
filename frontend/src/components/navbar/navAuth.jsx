"use client";
import Link from "next/link";
import { useAuth } from "@/components/auth/loginContext";
import Links from "./Links/Links";

const Navbar = () => {
	const { isAuthenticated, logout } = useAuth();

	return (
		<nav className="navbar">
			<div className="logo">
				<img src="/new-logo.svg" alt="logo" />
			</div>
			<div className="sign-in">
				{isAuthenticated ? (
					<>
						<Links />
						<div>
							<img
								src="/logout.svg"
								alt="logout"
								onClick={logout}
								className="img-logout"
							/>
						</div>
						<div className="logout-text" onClick={logout}>
							Logout
						</div>
					</>
				) : (
					<>
						<Link href="/auth/login" className="login">
							Login
						</Link>
						<Link href="/auth/signup" className="sign-up">
							Signup
						</Link>
					</>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
