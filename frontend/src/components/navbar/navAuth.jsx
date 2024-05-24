import Link from "next/link";
const Navbar = () => {
	return (
		<div>
			<nav>
				<Link href="/login">Login</Link>
				<Link href="/singup">Singup</Link>
			</nav>
		</div>
	);
};

export default Navbar;
