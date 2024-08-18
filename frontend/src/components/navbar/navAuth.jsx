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
