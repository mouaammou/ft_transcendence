'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/loginContext';
import Links from './Links/Links';
import Image from 'next/image';

const Navbar = () => {
  const { Logout, isAuth } = useAuth();

  return (
    <>
      <nav className="p-4">
        <div className="container p-[0px] mx-auto flex flex-row items-center justify-between sm:space-y-0">
          <div className="flex items-start justify-start w-full">
            <Image
              src="/new-logo.svg"
              width={100}
              height={100}
              alt="logo"
              priority={true}
              className="h-20 w-20 sm:h-16 sm:w-16 md:h-24 md:w-24"
            />
          </div>
          <div className="flex justify-end space-x-2 text-sm sm:text-lg w-full ml-9">
            {isAuth ? (
              <Links Logout={Logout} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-black bg-white bg-gradient-to-r from-[#00aabd] via-[#45CCDA] to-[#a9f5fd] px-4 py-2 rounded hover:bg-black hover:text-white transition duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-black bg-white px-4 py-2 rounded hover:bg-black hover:text-white transition duration-200"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
