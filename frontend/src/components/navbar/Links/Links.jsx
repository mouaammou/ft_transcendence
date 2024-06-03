import Link from "next/link";

const Links = () => {
	const links =  [
		{
			title: "Home",
			path: "/",
		},
		{
			title: "About Us",
			path: "/aboutus",
		},
		{
			title: "Game",
			path: "/game",
		},
		{
			title: "Features",
			path: "/features",
		},
		{
			title: "Contact",
			path: "/contact",
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