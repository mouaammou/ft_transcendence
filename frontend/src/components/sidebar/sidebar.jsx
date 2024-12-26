'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@components/auth/loginContext';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageCircle, Gamepad2, User, Settings, LogOut, UserPlus} from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { Logout, isAuth } = useAuth();

  const sidebarItems = [
    { label: 'Profile', icon: User, route: '/profile' },
    { label: 'Friends', icon: Users, route: '/friends' },
    { label: 'All Users', icon: UserPlus, route: '/allusers' },
    { label: 'Chat', icon: MessageCircle, route: '/chat' },
    { label: 'Game', icon: Gamepad2, route: '/play' },
    { label: 'Settings', icon: Settings, route: '/settings' },
  ];

  return (
    isAuth && (
      <div className="w-[7rem] bg-gray-800 backdrop-blur-lg bg-opacity-95 min-h-screen border-r border-gray-700">
        {/* Logo Section */}
        <Link 
          href="/"
          className="h-20 flex items-center justify-center"
        >
          <img 
            src="/main-logo.svg" 
            alt="logo" 
            className="w-12 h-12"
          />
        </Link>

        {/* Navigation Items */}
        <div className="px-2 py-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.route;
              
              return (
                <button 
                  key={item.route}
                  onClick={() => router.push(item.route)}
                  className={`
                    relative w-full flex flex-col items-center justify-center
                    py-3 px-1 rounded-xl
                    transition-all duration-300 ease-out
                    ${isActive 
                      ? 'text-white bg-gradient-to-t from-blue-500/20 to-blue-500/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <div className="relative">
                    <item.icon 
                      className={`
                        w-5 h-5 mb-1
                        transition-all duration-300 ease-out
                        ${isActive 
                          ? 'stroke-2 scale-110' 
                          : 'stroke-1.5 hover:scale-105'
                        }
                      `}
                    />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                    )}
                  </div>
                  <span className={`
                    text-[0.65rem] font-medium
                    transition-all duration-300
                    ${isActive 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-70 group-hover:opacity-100'
                    }
                  `}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500/20" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={Logout}
          className="absolute bottom-0 w-full py-4 px-2"
        >
          <div className={`
            relative flex flex-col items-center justify-center
            py-3 px-1 rounded-xl
            transition-all duration-300 ease-out
            text-red-400 hover:text-red-300 hover:bg-red-500/10
          `}>
            <LogOut className="w-5 h-5 mb-1 stroke-1.5" />
            <span className="text-[0.65rem] font-medium">Logout</span>
          </div>
        </button>
      </div>
    )
  );
}