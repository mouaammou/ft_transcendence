import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, User, MessageCircle, Gamepad2, Settings, UserPlus} from 'lucide-react';

export default function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Profile', icon: User, route: '/profile' },
    { label: 'Friends', icon: Users, route: '/friends' },
    { label: 'All Users', icon: UserPlus, route: '/allusers' },
    { label: 'Chat', icon: MessageCircle, route: '/chat' },
    { label: 'Game', icon: Gamepad2, route: '/play' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 backdrop-blur-lg bg-opacity-95 z-50">
      <div className="max-w-lg mx-auto px-4 pb-2 pt-2">
        <div className="grid grid-cols-5 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.route;
            
            return (
              <button 
                key={item.route}
                onClick={() => router.push(item.route)}
                className={`
                  relative flex flex-col items-center justify-center
                  py-2 px-1 rounded-xl
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
    </nav>
  );
}
