import Link from 'next/link';
import styles from '@/styles/navbar/navbar.module.css';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/loginContext';
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
    title: 'play',
    path: '/play',
  },
  {
    title: 'Chat',
    path: '/chat',
  },
];

const Links = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const { Logout } = useAuth();
  return (
    <div>
      <div className={styles.navbarLinks}>
        {links.map(link => (
          <Link
            href={link.path}
            key={link.title}
            className={`${styles.mylink} ${pathName === link.path && styles.active}`}
          >
            {link.title}
          </Link>
        ))}
      </div>
      <Image
        src="/menu.png"
        alt="menu"
        width={30}
        height={30}
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
    </div>
  );
};

export default Links;
