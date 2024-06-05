import Links from "./Links/Links";
import Link from "next/link";

const Navbar = () => {
	return (
		<div className="navbar">
			<div className="logo">
				<img src="/logo.svg" alt="logo" />
			</div>
			<Links/>
			<div className="sign-in">
				<div className="union">
					<img src="/Union.svg" alt="union" />
				</div>
				<div>
					<img src="/logout.svg" alt="logout" />
				</div>
				<div className="logout-text">
					LOGOUT
				</div>
				<button className="sign-up">Sign up</button>
				<button className="login">login</button>
			</div>
		</div>
	 );
}

export default Navbar;