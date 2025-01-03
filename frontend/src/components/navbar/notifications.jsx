import { useEffect, useState, useCallback } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline, IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import Link from 'next/link';
import useNotificationContext from '@components/navbar/useNotificationContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const NotificationLayout = ({ data, handleAction, NOTIFICATION_TYPES }) => {
    const { sendMessage } = useNotificationContext();
    const router = useRouter();
    const pathname = usePathname();
    const paths_game = ['/game', '/tournament_board'];

    const sendAction = useCallback((action, notif_type) => {
        let messageType = null;

        if (notif_type === NOTIFICATION_TYPES.FRIENDSHIP) {
            messageType = action === 'accepted' ? NOTIFICATION_TYPES.ACCEPT_FRIEND : NOTIFICATION_TYPES.REJECT_FRIEND;
        } else if (notif_type === NOTIFICATION_TYPES.INVITE_GAME) {
            messageType = action === 'accepted' ? NOTIFICATION_TYPES.ACCEPT_GAME : NOTIFICATION_TYPES.REJECT_GAME;
            if (action === 'accepted' && pathname !== '/game') {
                router.push('/game');
            }
        } else if (notif_type === NOTIFICATION_TYPES.ROUND && !paths_game.includes(pathname)) {
            router.push('/tournament_board');
        }



// // notif_status: "pending", notif_type: "friend"
// // accept_friend_request
        if (data.notif_status === 'pending' && data.notif_type === 'friend' && action === 'accepted')
            messageType = 'accept_friend_request';
        messageType && sendMessage(JSON.stringify({
            type: messageType,
            to_user_id: data.sender,
        }));
    }, [data.sender, NOTIFICATION_TYPES, router]); 



    const onAction = (action) => {
        handleAction(action, data);
        data.type && sendAction(action, data.type);
        data.notif_type && sendAction(action, data.notif_type);
    }

    return (
        <div className="relative flex items-center justify-between p-4 border-b border-gray-700/30 hover:bg-gray-700/40 transition-all duration-300 group">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all duration-300 shadow-lg" 
                        src={data.avatar} 
                        alt={`${data.username}'s avatar`} 
                    />
                    {data.type === NOTIFICATION_TYPES.FRIENDSHIP && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-800"></span>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <Link 
                        href={`/friend/${data.username}`} 
                        className="text-sm font-semibold text-gray-100 hover:text-blue-400 transition-colors duration-200"
                    >
                        {data.username}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1 max-w-[250px] truncate">
                        {data.message}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
                {data.notif_status === 'pending' ? (
                    <>
                        <button
                            onClick={() => onAction('accepted')}
                            className="bg-green-600/90 text-white rounded-full p-1.5 hover:bg-green-500 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            aria-label="Accept"
                        >
                            <IoCheckmarkOutline className="text-lg" />
                        </button>
                        <button
                            onClick={() => onAction('rejected')}
                            className="bg-red-600/90 text-white rounded-full p-1.5 hover:bg-red-500 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            aria-label="Reject"
                        >
                            <IoCloseOutline className="text-lg" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onAction('read')}
                        className="bg-blue-600/90 text-white rounded-full p-1.5 hover:bg-blue-500 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        aria-label="Mark as Read"
                    >
                        <IoCheckmarkDoneOutline className="text-lg" />
                    </button>
                )}
            </div>
        </div>
    );
};

const NotificationBell = () => {
    const { 
        notifications, 
        UnreadNotifications, 
        unreadCount, 
        markAsRead, 
        NOTIFICATION_TYPES, 
        setNotifications,
        lastMessage,
        isConnected
    } = useNotificationContext();
    const [isOpen, setIsOpen] = useState(false);

    // Handle mouse leave
    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    const handleAction = useCallback((notif_status, data) => {
        if (notif_status !== 'read')
            setNotifications((prev) => 
                prev.map((notif) => 
                    notif.id === data.id 
                        ? { ...notif, notif_status: notif_status } 
                        : notif
                )
            );
        markAsRead(data.id);
    }, [markAsRead, setNotifications]);

    useEffect(() => {
        UnreadNotifications();
    }, []);


    const toggleDropdown = () => setIsOpen((prev) => !prev);

    return (
        <div className="relative">
            <button 
                onClick={toggleDropdown}
                className="relative p-2.5 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transform hover:scale-105 transition-all duration-200"
            >
                <IoIosNotificationsOutline className="text-2xl text-gray-100" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform scale-100 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div onMouseLeave={handleMouseLeave} className="absolute max-sm:-right-16 right-0 top-full mt-3 w-96 max-sm:w-[22rem] bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 overflow-hidden z-50 transform opacity-100 scale-100 transition-all duration-200">
                    <div className="flex justify-between items-center p-4 bg-gray-800/95 border-b border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-100">Notifications</h3>
                        <Link 
                            href="/notifications" 
                            className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors duration-200"
                        >
                            See all
                        </Link>
                    </div>

                    <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent">
                        {notifications?.length > 0 ? (
                            notifications.map((notification, index) => (
                                <NotificationLayout
                                    key={index}
                                    data={notification}
                                    handleAction={handleAction}
                                    NOTIFICATION_TYPES={NOTIFICATION_TYPES}
                                />
                            ))
                        ) : (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <p className="text-sm">No new notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;