"use client";
import Link from "next/link";
import { useAuth } from "@/components/auth/loginContext";
import Links from "./Links/Links";
import styles from "@/Styles/navbar/navbar.module.css";
import Image from "next/image";

const Navbar = () => {
	const { isAuthenticated, logout } = useAuth();

	return (
		<nav className={styles.container}>
			<div className={styles.logo}>
				<Image src="/new-logo.svg" width={100} height={100} alt="logo" priority={true}/>
			</div>
				{isAuthenticated ? (
				<Links />
				):(null)}
			<div className={styles.signIn}>
				{isAuthenticated ? (
					<div className={styles.logoutText} onClick={logout}>
						Logout
					</div>
				) : (
					<>
						<Link href="/auth/login" className={styles.login}>
							Login
						</Link>
						<Link href="/auth/signup" className={styles.signUp}>
							Signup
						</Link>
					</>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
