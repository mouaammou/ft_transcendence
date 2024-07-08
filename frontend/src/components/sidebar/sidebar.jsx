// import { useRouter } from "next/router";
'use client'
import { useRouter } from "next/navigation";
// import Image from "next/image";
// import '../../styles/sidebar/sidebar.css';
import '@styles/sidebar/sidebar.css';

export default function Sidebar() {

    const router = useRouter();
    const sidebarItems = [
        {label: 'Home', icon: '/vector.svg', route: '/'},
        {label: 'Freinds',icon: '/3-User.svg', route: '/freinds'},
        {label: 'Profile',icon: '/Profil.svg', route: '/profile'},
        {label: 'Chat',icon: '/chat.svg', route: '/chat'},
        {label: 'Game',icon: '/Game.svg', route: '/Game'},
        {label: 'Setting',icon: '/Setting.svg', route: '/Setting'},
        // {label: 'Logout',icon: '/Logout.svg', route: '/Logout'},
        // {label: 'Logout',icon: '../public/back.png', route: '/Logout'},
    ];

    return(
        <div className ="container">
            <div className ="sidebar">
                <div className ="logo">
                    <img src="new-logo.svg" alt="" />
                    {/* <h2> ping pong</h2> */}
                </div>
                <div className ="icon_items">
                    <ul>
                        {sidebarItems.map((item, index) =>
                            <li key={index} className={router.pathname === item.route ? 'active' : ''}
                            
                            onClick={()=>router.push(item.route)}
                            >
                                <img  className="icone_side" src={item.icon} alt= {item.label} />
                            </li>
                        )
                        }
                    </ul>
                </div>
                <div className ="Logout">
                    <ul>
                        <li>
                            <img src="/Logout.svg" alt="" />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    ); 
}

// const Sidebar = () => {
//     return (
//         <div>Sidebar</div>
//     );
// }

// export default Sidebar;