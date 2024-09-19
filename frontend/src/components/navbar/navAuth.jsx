'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext';
import Links from './Links';
import Image from 'next/image';
import { useState } from 'react';
import { IoLogOut } from 'react-icons/io5';

const Logo = () => {
	return (
		// logo component
		<div className="flex-shrink max-w-20">
			<Link href="/">
				<Image
				src="/new-logo.svg"
				width={100}
				height={100}
				alt="logo"
				priority={true}
				className="h-20 w-20 sm:h-16 sm:w-16 md:h-24 md:w-24"
				/>
			</Link>
		</div>
	)
}

const Navbar = () => {
	const { Logout, isAuth } = useAuth();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<nav className="p-4">
				{
					isAuth ? ( // If user is authenticated, show the links
						<div className="container p-[0px] mx-auto flex flex-row items-center justify-between content-center sm:space-y-0">
							{/* logo component */}
							<Logo/>
							{/* links components */}
							<div className='w-full'>
								<Links/>
							</div>
							{/* drop down menu for User */}
							<div className="relative">
								<div
								onClick={() => setIsOpen(!isOpen)}
								className="rounded-lg px-5 py-2.5 text-center inline-flex items-center max-w-24 cursor-pointer"
								>
									<img src="https://randomuser.me/api/portraits/men/1.jpg" alt="down-arrow"/>
									<span className='w-full'>
									</span>
								</div>

								{isOpen && (
									<div className="z-10 absolute left-0 mt-2 divide-y rounded-lg">
										<ul className="py-0 text-sm w-full">
											{/* logout div */}
											<li
												className="group black-button w-32"
												onClick={Logout}
											>
												<IoLogOut className="h-5 w-5 text-white group-hover:text-black inline mx-2 transition duration-300" />
												<span className="text-[1rem]">Logout</span>
											</li>
										</ul>
									</div>

								)}
							</div>
							{/* end drop down menu for User */}
						</div>
					) : ( // if not authenticated, show login and signup buttons
						<div className="container p-[0px] mx-auto flex flex-row items-center justify-between sm:space-y-0">
							{/* logo component */}
							<Logo/>
							<div className=''>
								<Link
									href="/login"
									className="text-black bg-white px-4 py-2 mr-2 rounded"
								>
									Login
								</Link>
								<Link href="/signup" className="text-black bg-white px-7 py-2 rounded">
									Signup
								</Link>
							</div>
						</div>
					)
				}
				{/* <div className="container p-[0px] mx-auto flex flex-row items-center justify-between sm:space-y-0">
					<div className="flex-shrink max-w-52">
						<Link href="/">
							<Image
							src="/new-logo.svg"
							width={100}
							height={100}
							alt="logo"
							priority={true}
							className="h-20 w-20 sm:h-16 sm:w-16 md:h-24 md:w-24"
							/>
						</Link>
					</div>
						{isAuth ? (
						<Links Logout={Logout} />
						) : (
						<div className=''>
							<Link
								href="/login"
								className="text-black bg-white px-4 py-2 mr-2 rounded"
							>
								Login
							</Link>
							<Link href="/signup" className="text-black bg-white px-7 py-2 rounded">
								Signup
							</Link>
						</div>
						)}
				</div> */}
			</nav>
		</>
	);
};

export default Navbar;
