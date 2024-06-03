import Link from "next/link";

const Links = () => {
	const links =  [
		{
			title: "Homepage",
			path: "/",
		},
		{
			title: "Aboutus",
			path: "/aboutus",
		},
		{
			title: "Project",
			path: "/project",
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
		<div>
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