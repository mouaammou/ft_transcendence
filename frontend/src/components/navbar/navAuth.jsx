"use client";
import Link from "next/link";
import { useAuth } from "@/components/auth/loginContext";
import Links from "./Links/Links";
import { useState } from "react";
import { useEffect } from "react";

const Navbar = () => {
	const { Logout, isAuth } = useAuth();
	
	return (
		<nav className="navbar">
			<div className="logo">
				<img src="/new-logo.svg" alt="logo" />
			</div>
			<div className="sign-in">
				{isAuth ? (
					<>
						<Links />
						<div>
							<img
								src="/logout.svg"
								alt="logout"
								onClick={Logout}
								className="img-logout"
							/>
						</div>
						<div className="logout-text" onClick={Logout}>
							Logout
						</div>
					</>
				) : (
					<>
						<Link href="/login" className="login">
							Login
						</Link>
						<Link href="/signup" className="sign-up">
							Signup
						</Link>
					</>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
