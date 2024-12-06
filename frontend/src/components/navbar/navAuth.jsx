	'use client';
	import Link from 'next/link';
	import Image from 'next/image';
	import { useState, useEffect } from 'react';
	import { usePathname } from 'next/navigation';
	import { IoLogOut } from 'react-icons/io5';
	import { useAuth } from '@/components/auth/loginContext';
	import NotificationBell from './notifications';
	import SearchProfileComponent from './search';

	const Logo = () => (
	<div className="flex-shrink max-w-20">
		<Link href="/">
		<Image
			src="/main-logo.svg"
			width={1}
			height={1}
			alt="logo"
			priority={true}
			className="h-20 w-16 sm:h-16 sm:w-16 md:h-24 md:w-24 p-2"
		/>
		</Link>
	</div>
	);

	const UserDropdown = ({ isOpen, setIsOpen, data, Logout }) => (
	<div className="relative">
		<button
		type="button"
		onClick={() => setIsOpen(!isOpen)}
		className="max-w-20 overflow-hidden flex text-sm bg-gray-800 rounded-full border-2 border-gray-500"
		>
		<img className="w-20 h-fit" src={data.avatar} alt="user-avatar" />
		</button>

		{isOpen && (
		<div
			onClick={() => setIsOpen(false)}
			className="z-50 absolute right-3 mt-4 top-14 text-base list-none divide-y rounded-lg shadow-lg w-48 bg-gray-800 text-gray-400 h-50"
		>
			<div className="px-4 py-3">
			<span className="block text-sm text-white">{data.username}</span>
			<span className="block text-sm truncate text-gray-400">{data.email}</span>
			</div>
			<ul className="py-2">
			{[
				{ href: '/profile', label: 'Profile' },
				{ href: '/edit_profile', label: 'Settings' },
				{ href: '/tournament', label: 'Create Tournament' },
				{ href: '/play', label: 'Start Game' },
			].map(({ href, label }) => (
				<li key={href}>
				<Link
					href={href}
					className="block px-4 py-2 text-sm text-white hover:text-gray-700 hover:bg-gray-100"
				>
					{label}
				</Link>
				</li>
			))}
			<li>
				<button
				onClick={Logout}
				className="w-full text-left block px-4 py-2 text-sm text-white hover:text-gray-700 hover:bg-gray-100"
				>
				Logout
				<IoLogOut className="inline-block mx-3 px-1 text-[1.6rem]" />
				</button>
			</li>
			</ul>
		</div>
		)}
	</div>
	);

	const AuthenticatedNav = ({ data, Logout }) => {
	const [isOpen, setIsOpen] = useState(false);
	
	return (
		<div className="flex flex-row items-center justify-between bg-orange-500 pr-10">
		<div className="w-full">
			<SearchProfileComponent />
		</div>
		<div className="mx-10 max-sm:mx-3 max-sm:hidden">
			<NotificationBell />
		</div>
		<div className="max-sm:hidden">
			<h3 className="text-gray-800 text-xl font-semibold mx-4 mt-2">{data.username}</h3>
		</div>
		<UserDropdown isOpen={isOpen} setIsOpen={setIsOpen} data={data} Logout={Logout} />
		</div>
	);
	};

	const UnauthenticatedNav = ({ loginPage }) => (
	<div className="container p-[0px] mx-auto flex flex-row items-center justify-between sm:space-y-0">
		<Logo />
		<div>
		<Link
			href={loginPage === 'Login' ? '/login' : '/signup'}
			className="text-white border border-white px-16 py-4 mr-2 rounded hover:bg-white hover:text-gray-800 transition-all duration-300 max-md:px-10 text-sm"
		>
			{loginPage}
		</Link>
		</div>
	</div>
	);

	const Navbar = () => {
	const { Logout, isAuth, profileData: data } = useAuth();
	const pathname = usePathname();
	const [loginPage, setLoginPage] = useState(pathname === '/login' ? 'Sign Up' : 'Login');

	useEffect(() => {
		setLoginPage(pathname === '/login' ? 'Sign Up' : 'Login');
		return () => setLoginPage('');
	}, [pathname]);

	return (
		<nav className="relative z-10">
		{isAuth ? (
			<AuthenticatedNav data={data} Logout={Logout} />
		) : (
			<UnauthenticatedNav loginPage={loginPage} />
		)}
		</nav>
	);
	};

	export default Navbar;