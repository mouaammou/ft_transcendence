"use client";
import { useEffect, useState, useCallback } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline, IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import Link from 'next/link';
import useNotificationContext from '@components/navbar/useNotificationContext';
import { useRouter } from 'next/navigation';

const NotificationLayout = ({ data, handleAction, NOTIFICATION_TYPES }) => {
    const { sendMessage } = useNotificationContext();
    const router = useRouter();

    const sendAction = useCallback((action, notif_type) => {
        let messageType = null;
        console.log("\n Notification type: ", notif_type);
        console.log("\n Action: ", action);
        if (notif_type === NOTIFICATION_TYPES.FRIENDSHIP) {
            messageType = action === 'accepted' ? NOTIFICATION_TYPES.ACCEPT_FRIEND : NOTIFICATION_TYPES.REJECT_FRIEND;
        } else if (notif_type === NOTIFICATION_TYPES.INVITE_GAME) {
            console.log("\n Notification type: 1002 ", notif_type);
            messageType = action === 'accepted' ? NOTIFICATION_TYPES.ACCEPT_GAME : NOTIFICATION_TYPES.REJECT_GAME;
            if (action === 'accepted'){
                router.push('/game');
            }
        } else if (notif_type === NOTIFICATION_TYPES.ROUND) {
            router.push('/tournament_board');
        }
        
        messageType && sendMessage(JSON.stringify({
            type: messageType,
            to_user_id: data.sender,
        }));
    }, [data.sender, NOTIFICATION_TYPES, router]); 

    const onAction = (action) => {
        handleAction(action, data);
        data.type &&
            sendAction(action, data.type);
        data.notif_type && sendAction(action, data.notif_type);
    }

    return (
        <div className="relative flex items-center justify-between py-3 px-4 border-b border-gray-700/30 hover:bg-gray-800/20 transition-colors duration-200 group">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img 
                        className="w-10 h-10 min-w-10 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all" 
                        src={data.avatar} 
                        alt={`${data.username}'s avatar`} 
                    />
                    {data.type === NOTIFICATION_TYPES.FRIENDSHIP && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                </div>
                
                <div>
                    <Link 
                        href={`/${data.username}`} 
                        className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                        {data.username}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1 max-w-[250px] truncate">
                        {data.message}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {data.notif_status === 'pending' && (
                    <>
                        <button
                            onClick={() => onAction('accepted')}
                            className="bg-green-600 text-white rounded-full p-1.5 hover:bg-green-700 transition-colors"
                            aria-label="Accept"
                        >
                            <IoCheckmarkOutline className="text-lg" />
                        </button>
                        <button
                            onClick={() => onAction('rejected')}
                            className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors"
                            aria-label="Reject"
                        >
                            <IoCloseOutline className="text-lg" />
                        </button>
                    </>
                )}
                {data.notif_status !== 'pending' && (
                <button
                    onClick={() => onAction('read')}
                    className="bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors"
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
        setNotifications 
    } = useNotificationContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = useCallback((notif_status, data) => {
        if (notif_status !== 'read')
            setNotifications((prev) => 
                prev.map((notif) => 
                    notif.id === data.id 
                        ? { ...notif, notif_status: notif_status } 
                        : notif
                )
            );
        console.log("\n Notification DATA: ", data);
        markAsRead(data.id);
    }, [markAsRead, setNotifications]);

	// Fetch unread notifications on component mount
	useEffect(() => {
		UnreadNotifications();
	}, []);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    return (
        <div className="relative">
            <div className="relative">
                <button 
                    onClick={toggleDropdown}
                    className="relative p-2 rounded-full bg-gray-700/30 transition-colors"
                >
                    <IoIosNotificationsOutline className="text-2xl text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center 
                            w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="absolute max-sm:-right-16 right-0 top-full mt-2 w-96 max-sm:w-[22rem] max-h-[400px] bg-gray-800 
                    rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            <Link 
                                href="/notifications" 
                                className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                            >
                                See all
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
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
                            <div className="text-center py-6 text-gray-400">
                                <p>No new notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;