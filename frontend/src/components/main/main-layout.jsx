import { useAuth } from "@/components/auth/loginContext";
import Navbar from '@/components/navbar/navAuth';
import Sidebar from '@/components/sidebar/sidebar';
import MobileNavbar from "@/components/sidebar/MobileSidebar";

const MainLayout = ({ children }) => {
    const { isAuth } = useAuth();

    return (
        <div className="min-h-screen w-full">
            {isAuth ? (
                <div className="min-h-screen">
                    {/* Sidebar - Desktop only */}
                    <div className="hidden md:block fixed top-0 left-0 h-full w-[7rem]">
                        <Sidebar />
                    </div>

                    {/* Main content wrapper */}
                    <div className="min-h-screen md:pl-[7rem]">
                        <Navbar />
                        <main className=" h-full w-full pb-16 md:pb-0"> {/* Space for mobile nav */}
                        {/* dddd */}
                            {children}
                        </main>

                        {/* Mobile Navigation */}
                        <div className="fixed bottom-0 left-0 right-0 md:hidden">
                            <MobileNavbar />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen">
                    <Navbar />
                    <main className="h-full">
                        {children}
                    </main>
                </div>
            )}
        </div>
    );
}

export default MainLayout;