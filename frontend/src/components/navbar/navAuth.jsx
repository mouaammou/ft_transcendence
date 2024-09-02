"use client";
import Link from "next/link";
import { useAuth } from "@/components/auth/loginContext";
import Links from "./Links/Links";
import styles from "@/styles/navbar/navbar.module.css";
import Image from "next/image";

const Navbar = () => {

	const { Logout, isAuth } = useAuth();
	
	return (
		<nav className={styles.container}>
			<div className={styles.logo}>
				<Image src="/new-logo.svg" width={100} height={100} alt="logo" priority={true}/>
			</div>
			<div className={styles.signIn}>
				{isAuth ? (
					<div>
						<Links />
						<div className={styles.logoutText} onClick={Logout}>
							Logout
						</div>
					</div>
				) : (
					<div>
						<Link href="/login" className={styles.login}>
							Login
						</Link>
						<Link href="/signup" className={styles.signUp}>
							Signup
						</Link>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
