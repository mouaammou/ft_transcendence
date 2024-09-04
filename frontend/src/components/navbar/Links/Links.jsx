import Link from 'next/link';
import styles from '@/styles/navbar/navbar.module.css';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

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
          className="bg-black px-4 py-2 rounded cursor-pointer hover:bg-white hover:text-black transition duration-300"
          onClick={Logout}
        >
          Logout
        </div>
      </div>

      {/* for mobile navigation */}
      <Image
        src="/menu.png"
        alt="menu"
        width={40}
        height={40}
        className={styles.menubtn}
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
