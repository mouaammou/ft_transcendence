import { useAuth } from "@components/auth/loginContext";
import Navbar from '@/components/navbar/navAuth';
import Sidebar from '@/components/sidebar/sidebar';


const MainLayout = ({ children }) => {

	const {isAuth } = useAuth();

	return (
		<div className="main-root-layout">
			<div className={isAuth ? 'parent-authenticated' : 'parent-not-authenticated'}
			>
				{isAuth && 
					<div className="SIDE-NAV ">
						
						<Sidebar />
					</div>
				}
				<div className="OTHERS">
					<Navbar />
					{children}
				</div>
			</div>
		</div>
	);
}

export default MainLayout;