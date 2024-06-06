import Link from "next/link";

const Links = () => {
	const links =  [
		{
			title: "Home",
			path: "/",
		},
		{
			title: "profile",
			path: "/profile",
		},
		{
			title: "Game",
			path: "/game",
		},
		{
			title: "Dashboard",
			path: "/dashboard",
		},
		{
			title: "Chat",
			path: "/chat",
		},
	];
	return (
		<div className="navbar-links">
			{
				links.map(link => (
					<Link href={link.path} key={link.title}>
						{link.title}
					</Link>
				))
			}
		</div>
	 );
}

export default Links;