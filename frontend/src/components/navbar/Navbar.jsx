import Links from "./Links/Links";
import Link from "next/link";
import '@/Styles/navbar/navbar.css'

const NavbarLogin = ({Logout}) => {
	return (
		<div className="navbar">
			<div className="logo">
				<img src="new-logo.svg" alt="logo" priority={true}/>
			</div>
			<Links/>
			<div className="sign-in">

				<div className="union">
					<img src="/Union.svg" alt="union" />
				</div>
				<div>
					<img src="/logout.svg" alt="logout" className="img-logout"/>
				</div>
				<div className="logout-text" onClick={Logout}>
					LOGOUT
				</div>

			</div>
		</div>
	 );
}

export default NavbarLogin;