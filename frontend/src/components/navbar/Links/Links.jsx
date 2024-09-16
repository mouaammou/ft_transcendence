import Link from 'next/link';
import styles from '@/styles/navbar/navbar.module.css';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IoLogOut } from 'react-icons/io5';
import { CgMenuLeftAlt } from 'react-icons/cg';

const links = [
	{
		title: 'Home',
		path: '/',
	},
	{
		title: 'profile',
		path: '/profile',
	},
	{
		title: 'Game',
		path: '/game',
	},
	{
		title: 'play',
		path: '/play',
	},
	{
		title: 'All Users',
		path: '/allusers',
	},
	{
		title: 'Chat',
		path: '/chat',
	},
];
const Links = ({ Logout }) => {
	const [isOpen, setIsOpen] = useState(false);
	const pathName = usePathname();
	return (
		<>
			<div className="hidden sm:flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 font-suse text-[1.3rem]">
			{links.map(link => (
				<Link
					href={link.path}
					key={link.title}
					className="text-white hover:text-gray-300 transition duration-300 px-4 py-2"
				>
					{link.title}
				</Link>
			))}

			<div
				className="group black-button"
				onClick={Logout}
			>
				<IoLogOut className="h-5 w-5 text-white group-hover:text-black inline mx-2 transition duration-300" />
				<span className="text-[1rem]">Logout</span>
			</div>
			</div>

			{/* for mobile navigation */}
			<CgMenuLeftAlt
			className={`${styles.menubtn} text-black  bg-white hover:bg-gray-100 p-2 rounded-full shadow-md transition-all duration-300 ease-in-out cursor-pointer w-10 h-10 absolute top-[2rem] right-[1rem]`}
			onClick={() => {
				setIsOpen(prev => !prev);
			}}
			/>
			{isOpen && (
			<div className={styles.mobileLinks}>
				{links.map(link => (
					<Link
					href={link.path}
					key={link.title}
					className={`${styles.mylink} ${pathName === link.path && styles.active}`}
					onClick={() => setIsOpen(prev => !prev)}
					>
					{link.title}
					</Link>
				))}
				<div className={styles.logoutTextt} onClick={Logout}>
					Logout
				</div>
			</div>
			)}
		</>
	);
};

export default Links;
