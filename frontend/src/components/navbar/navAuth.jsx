'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext';
import Links from './Links/Links';
import styles from '@/styles/navbar/navbar.module.css';
import Image from 'next/image';
import '@/styles/navbar/navbarTailwind.css';

const Navbar = () => {
  const { Logout, isAuth } = useAuth();

  return (
    // <nav className="">
    // 	<div className="">
    // 		<Image src="/new-logo.svg" width={100} height={100} alt="logo" priority={true}/>
    // 	</div>
    // 	<div className="">
    // 		{isAuth ? (
    // 			<div className="">
    // 				<Links />
    // 				<div className="" onClick={Logout}>
    // 					Logout
    // 				</div>
    // 			</div>
    // 		) : (
    // 			<>
    // 				<Link href="/login" className="">
    // 					Login
    // 				</Link>
    // 				<Link href="/signup" className="">
    // 					Signup
    // 				</Link>
    // 			</>
    // 		)}
    // 	</div>
    // </nav>

    <nav className="p-4">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex items-center">
          <Image
            src="/new-logo.svg"
            width={100}
            height={100}
            alt="logo"
            priority={true}
            className="h-20"
          />
        </div>
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          {isAuth ? (
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Links />
              <div
                className=" bg-black px-4 py-2 rounded cursor-pointer hover:bg-white hover:text-black transition duration-300"
                onClick={Logout}
              >
                Logout
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-white bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
