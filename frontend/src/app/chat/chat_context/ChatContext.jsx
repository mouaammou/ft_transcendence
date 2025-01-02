'use client';

import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { deleteData, getData , postData} from '@/services/apiCalls';
import { useAuth } from '@/components/auth/loginContext.jsx';


import { useDebounce } from 'use-debounce';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import useNotificationContext from '@/components/navbar/useNotificationContext';
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {


    //  ************************ All State hooks  ************************
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [messages, setMessages] = useState({});
    const [typingUsers, setTypingUsers] = useState([]); 
    const [prevScrollHeight, setPrevScrollHeight] = useState(0); 
    const [onlineUsers, setOnlineUsers] = useState([]); 
    const [socket, setSocket] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
    const { profileData: currentUser , isAuth} = useAuth();
    const chatContainerRef = useRef(null);
    const endRef = useRef(null); 
    const typingTimeoutRef = useRef(null); 
    const emojiPickerRef = useRef(null);
    const isFetchingRef = useRef(false); // To prevent multiple fetches at once
    const scrollTimeoutRef = useRef(null);
    const selectedUserRef = useRef(null);
    const [activeScrollToEnd, setActiveScrollToEnd] = useState(false);

    const [friendStatusRequests, setFriendStatusRequests] = useState({});
    const { isConnected, NOTIFICATION_TYPES, lastJsonMessage, sendMessage, lastMessage } = useNotificationContext();

    // Update friend status helper
    const updateFriendStatus = (userId, status) => {
        setFriendStatusRequests(prevStatuses => ({
            ...prevStatuses,
            [userId]: status
        }));
    };


    // ************************ end ***********************

    const {
		users,
		setUsers,
	} = useWebSocketContext();

    // ************************  Fetch friends (users to chat with) ************************
    const fetchFriends = async (search = '') => {
        try {
            const url = `/chat-friends?search=${search}`;
            const response = await getData(url);
            
            if (response.status === 200) {

                const newUsers = response.data;
                if (!search) {
                    setOriginalUsers(newUsers);
                }
                setAllUsers(newUsers);

            }
            // Handle unauthorized response
            else if (response.status === 401) {
                // Handle unauthorized response

            } 
            else {

            }
        } catch (error) {

        }
    };

    // ************************  Fetch fetchOnlineUsers ************************

     const fetchOnlineUsers = () => {

        const onlineUsers = originalUsers.filter(user => user.friend && user.friend.status === 'online');

        setOnlineUsers(onlineUsers);
    };

    useEffect(() => {
        fetchOnlineUsers();
    }, [originalUsers]);

    
    //  ************************  Handle search functionality  ************************

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    useEffect(() => {
        if (isAuth) {
            fetchFriends(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, isAuth]);
    
    // ************************ end ***********************
    
    // ************************  handleOnlineStatus ************************
    
    const handleOnlineStatus = useCallback(
        (message) => {
            if (!message || !isConnected) return;
            try 
            {
                const data = JSON.parse(message.data);
                if (data.type === 'user_status_change') {

                    setAllUsers((prevUsers) =>
                        prevUsers.map((user) =>
                            user.friend && user.friend.username === data.username
                        ? { ...user, friend: { ...user.friend, status: data.status } }
                        : user
                    ));
                    setOriginalUsers((prevUsers) =>
                        prevUsers.map((user) =>
                            user.friend && user.friend.username === data.username
                                ? { ...user, friend: { ...user.friend, status: data.status } }
                                : user
                        )
                    );
                }
            } catch (error) {

            }
        },
        [isConnected]
    );

    // Effect to handle incoming WebSocket messages
    useEffect(() => {
        if (lastMessage) handleOnlineStatus(lastMessage);
    }, [lastMessage, handleOnlineStatus]);
    // ************************ end ***********************


    // ************************ Helper Functions ************************

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to format date (e.g., "October 10, 2024")
    const formatDate = timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Group messages by date
    const groupMessagesByDate = (messagesList) => {
        const groupedMessages = {};

        messagesList.forEach(message => {
            const messageDate = formatDate(message.timestamp);

            if (!groupedMessages[messageDate]) {
            groupedMessages[messageDate] = [];
            }
            groupedMessages[messageDate].push(message);
        });
        return groupedMessages;
    };

    // ************************ end ***********************
    
    // ************************  Merge and sort messages (both old and new) ***********************

    const mergeAndSortMessages = (existing, incoming) => {
        const merged = { ...existing };

        for (const [date, newMessages] of Object.entries(incoming)) {
            const currentMessages = merged[date] || []; // Get existing messages for the date
            const combined = [...currentMessages, ...newMessages];
            // Sort messages within the date by timestamp (oldest to newest)
            merged[date] = combined.sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
        }
        // Sort the dates themselves (keys) in ascending order
        const sortedDates = Object.keys(merged).sort(
            (a, b) => new Date(a) - new Date(b)
        );
        
        // Rebuild the sorted object
        const sortedMessages = {};
        for (const date of sortedDates) {
            sortedMessages[date] = merged[date];
        }
        return sortedMessages;
    };
    // ************************ end ***********************


    // ************************ Fetch chat history (handles both initial and pagination requests) ************************

    const fetchChatHistory = async (receiver_id, page = 1) => {
        if (isFetchingRef.current) 
        {

            return; // Prevent multiple requests at once
        }
        try {
            isFetchingRef.current = true;
            const url = `/chat-history/${receiver_id}?page=${page}`;
            const response = await getData(url);

            if (response.status === 200 && response.data.results) {
                const messagesList = response.data.results;
                const groupedMessages = groupMessagesByDate(messagesList);

                if (page === 1) {
                    setMessages({
                        [receiver_id]: mergeAndSortMessages({}, groupedMessages, selectedUserRef, receiver_id),
                    });
                } else {
                    setMessages((prevMessages) => ({
                        ...prevMessages,
                        [receiver_id]: mergeAndSortMessages(prevMessages[receiver_id] || {}, groupedMessages, selectedUserRef, receiver_id),
                    }));
                }
                const nextPageUrl = response.data.next;
                const nextPageNumber = nextPageUrl
                    ? new URL(nextPageUrl).searchParams.get('page')
                    : null;
                setNextPage(nextPageNumber ? Number(nextPageNumber) : null);

            }
            else {
                console.warn("No results in response or invalid response format.");
                setNextPage(null);
            }
        } catch (error) {

        } finally {
            isFetchingRef.current = false;

        }
    };
    
    // ************************ end ***********************


    //  ************************ Handle user click (select a chat) ************************

    const handleUserClick = (user) => {
        console.log("user ** ", user);
        setSelectedUser(user);
        setIsChatVisible(true);
        if (selectedUser && selectedUser.id === user.id) {
            return;
        }
        console.log("allUsers ** ", allUsers);
        const userFriendshipStatus = allUsers.find(
            (friend) => friend.friend.id === user.id
        )?.friend.friendship_status;

        console.log("userFriendshipStatus ** ", userFriendshipStatus);
        if (userFriendshipStatus === 'blocking' || userFriendshipStatus === 'blocked') {
            updateFriendStatus(user.id, 'blocking');
        } else {
            updateFriendStatus(user.id, 'accepted');
        }

        // ... rest of existing handleUserClick logic ...
        setIsChatVisible(true);
        fetchChatHistory(user.id, 1);
        selectedUserRef.current = user;
        setNextPage(null);
        setTimeout(() => {
            scrollToEnd();
        }, 100);

        if (socket) {            
            socket.send(JSON.stringify({ mark_read: true, contact: user.username }));
            setAllUsers((prevUsers) =>
                prevUsers.map((friend) =>
                    friend.friend.id === user.id
                        ? {
                            ...friend,
                            last_message: {
                                ...friend.last_message,
                                is_read: true,
                                unread_count: 0,
                            }
                        }
                        : friend
                )
            );
        }
    };
    // ************************ end ***********************

    // *********** block friends ********

    const blockFriend = useCallback(() => {




        if (isConnected && selectedUserRef.current?.id) {
            // Optimistic update
            setAllUsers((prevUsers) =>
                prevUsers.map((friend) =>
                    friend.friend.id === selectedUserRef.current.id
                        ? {
                            ...friend,
                            friend: {
                                ...friend.friend,
                                friendship_status: 'blocking',
                            },
                        }
                        : friend
                )
            );
    
            sendMessage(
                JSON.stringify({
                    type: NOTIFICATION_TYPES.BLOCK,
                    to_user_id: selectedUserRef.current.id,
                })
            );
        }
    }, [isConnected, selectedUserRef.current?.id, sendMessage]);
    
    const removeBlock = useCallback(() => {
        if (isConnected && selectedUserRef.current?.id) {
            // Optimistic update
            setAllUsers((prevUsers) =>
                prevUsers.map((friend) =>
                    friend.friend.id === selectedUserRef.current.id
                        ? {
                            ...friend,
                            friend: {
                                ...friend.friend,
                                friendship_status: 'accepted',
                            },
                        }
                        : friend
                )
            );
    
            sendMessage(
                JSON.stringify({
                    type: NOTIFICATION_TYPES.REMOVE_BLOCK,
                    to_user_id: selectedUserRef.current.id,
                })
            );
        }
    }, [isConnected, selectedUserRef.current?.id, sendMessage]);
    // *********** end block friends ********

    // const NOTIFICATION_TYPES = {
    //     FRIENDSHIP: 'send_friend_request',
    //   BLOCK: 'block_user',
    //   REMOVE_FRIEND: 'remove_friend',
    //   REMOVE_BLOCK: 'remove_block',
    //     ACCEPT_FRIEND: 'accept_friend_request',
    //   ACCEPTED_DONE: 'accepted_done',
    //     REJECT_FRIEND: 'reject_friend_request',
    //     INVITE_GAME: 'invite_to_game',
    //     ACCEPT_GAME: 'accept_game',
    //     REJECT_GAME: 'reject_game',
    //     INVITE_TOURNAMENT: 'invite_to_tournament',
    //     ACCEPT_TOURNAMENT: 'accept_tournament',
    //     REJECT_TOURNAMENT: 'reject_tournament',
    //     ROUND: 'round_game',
    //   ACCEPT_ROUND: 'accept_round',
    //   REJECT_ROUND: 'reject_round',
    // };


    useEffect(() => {
        if (!lastJsonMessage || !isConnected || !selectedUserRef.current?.id) return;
        console.log(" 110 chat context lastJsonMessage ** ", lastJsonMessage);
        // Handle different message types
        switch (lastJsonMessage.type) {
            case NOTIFICATION_TYPES.BLOCK:
                if (lastJsonMessage.success && lastJsonMessage.to_user_id === selectedUserRef.current.id) {
                    // If blocked is true, I've been blocked. If null, I'm the one blocking
                    console.log("BLOCK ** ", lastJsonMessage);
                    const newStatus = lastJsonMessage.blocked ? 'blocked' : 'blocking';
                    setAllUsers((prevUsers) =>
                        prevUsers.map((friend) =>
                            friend.friend.id === selectedUserRef.current.id
                                ? {
                                    ...friend,
                                    friend: {
                                        ...friend.friend,
                                        friendship_status: newStatus,
                                    },
                                }
                                : friend
                        )
                    );
                }
                break;
                
            case NOTIFICATION_TYPES.REMOVE_BLOCK:
                if (lastJsonMessage.success && lastJsonMessage.to_user_id === selectedUserRef.current.id) {
                    setAllUsers((prevUsers) =>
                        prevUsers.map((friend) =>
                            friend.friend.id === selectedUserRef.current.id
                                ? {
                                    ...friend,
                                    friend: {
                                        ...friend.friend,
                                        friendship_status: 'accepted',
                                    },
                                }
                                : friend
                        )
                    );
                }
                break;
        }
    }, [lastJsonMessage, isConnected]);

  //  ************************  ************************
  const handleSendMessage = () => {



    // if (text.trim() && selectedUser && socket && socket.readyState === WebSocket.OPEN) {
    if (text.trim() && selectedUser && socket) {

        const messageData = {
            sender: currentUser.username,
            receiver: selectedUser.username,
            message: text.trim(),
        };



      socket.send(JSON.stringify(messageData));

      setText('');
    }
    else {



    }

    };
    // ************************ end ***********************


    // ************************ Handle keypress event and typing indication ************************

    const handleTyping = () => {
        if (selectedUser && socket) {
            const typingData = {
                sender: currentUser.username,
                receiver: selectedUser.username,
                typing: true,
            };
            socket.send(JSON.stringify(typingData));
        }

            // Clear the existing typing timeout if user continues typing
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set a timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (selectedUser && socket) {
                const stopTypingData = {
                    sender: currentUser.username,
                    receiver: selectedUser.username,
                    typing: false,
                };
                socket.send(JSON.stringify(stopTypingData));
            }
        }, 2000);
    };


    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
        else {
            
            handleTyping();
        }
    };
    // ************************ end ***********************

    // *********** updateLastMessage ********

    const updateLastMessage = (userId, message, is_read, timestamp) => {
        setAllUsers((prevUsers) =>
            prevUsers.map((user) => {
                if (user.friend.id === userId) {
                    const unreadCount = is_read ? 0 : (user.last_message?.unread_count || 0) + 1;
    
                    return {
                        ...user,
                        last_message: { 
                            message, 
                            is_read, 
                            timestamp, 
                            unread_count : unreadCount
                        },
                    };
                }
                return user;
            })
        );
    };

    // ************************ Manage WebSocket connection ************************
    const connectWebSocket = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {

        socket.close(); 
        }else {

        }

        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws/chat`);

        ws.onopen = () => {

        };

        ws.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            const { sender, receiver, message, receiver_id, sender_id, typing , mark_read, contact , session_user} = receivedData;

            if (message) {

                setActiveScrollToEnd(true);
                if (selectedUserRef.current && selectedUserRef.current.id === sender_id) {
                    // Mark the message as read since the receiver is actively viewing this chat
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ mark_read: true, contact: sender }));
                    }else {


                    }
                    updateLastMessage(sender_id, message, true, receivedData.timestamp);
                } else {
                    updateLastMessage(sender_id, message, false, receivedData.timestamp);
                }

                // Always update the sender's view of the receiver's last message
                updateLastMessage(receiver_id, message, true, receivedData.timestamp);

                setMessages((prevMessages) => {
                    const updatedMessages = { ...prevMessages };
        
                    const messageDate = formatDate(receivedData.timestamp);
        
                    // Prepare the incoming message grouped by date
                    const groupedMessages = {
                        [messageDate]: [receivedData],
                    };
        
                    // Update sender and receiver messages using mergeAndSortMessages
                    updatedMessages[sender_id] = mergeAndSortMessages(
                        updatedMessages[sender_id] || {},
                        groupedMessages,
                        selectedUserRef,
                        receiver_id
                    );
        
                    updatedMessages[receiver_id] = mergeAndSortMessages(
                        updatedMessages[receiver_id] || {},
                        groupedMessages,
                        selectedUserRef,
                        receiver_id
                    );
        
                    return updatedMessages;
                });
            }

            if (mark_read && contact) {
                updateLastMessage(sender_id, message, true, receivedData.timestamp);
            }
                    
            if (typing)
            {
                if (!typingUsers.includes(sender)) {
                    setTypingUsers((prev) => [...prev, sender]);
                }
            } else {
                    setTypingUsers((prev) => prev.filter(user => user !== sender));
            }
        };

        ws.onclose = event => {


        };

        ws.onerror = error => {

        };

        setSocket(ws);
    };
  // ************************ end ***********************


    //  ************************ handle emoji  ************************
        const handleEmojiClick = emoji => {
        setText(prev => prev + emoji.emoji);

    };
    // ************************ end ***********************


    //  ************************ handle back button click, hide the chat component on smaller screens ************************
    const handleBackClick = () => {
        setIsChatVisible(false);
    };
    // ************************ end ***********************

 // ************************ Handle scroll event to fetch older messages ************************

    const handleFetchOlderMessages = async () => {
        if (!nextPage) {

            return;
        }            
        const chatContainer = chatContainerRef.current;
        if (!chatContainer) {
            return;
        }
        // Save the current scroll height before fetching
        setPrevScrollHeight(chatContainer.scrollHeight);
        
        try {
            await fetchChatHistory(selectedUser.id, nextPage);
            // Restore scroll position to the first newly fetched message
            const scrollDelta = chatContainer.scrollHeight - prevScrollHeight;
            chatContainer.scrollTop = scrollDelta;
        } catch (error) {

        } finally {
            isFetchingRef.current = false;

        }
    };

    

    const handleScroll = (event) => {
        const chatContainer = event.target;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Set a new timeout to fetch the next page after a delay (e.g., 300ms)
        scrollTimeoutRef.current = setTimeout(() => {
            if (chatContainer.scrollTop <= 50) {
                setActiveScrollToEnd(false);
                handleFetchOlderMessages();
            }
        }, 300);
    };

        // ********** Scroll to the end of the messages ***********

    useEffect(() =>{
        if (activeScrollToEnd)
            scrollToEnd();
    }, [messages])

    const scrollToEnd = () => {
        if (endRef.current)
            endRef.current.scrollIntoView({ behavior: "smooth" });
    };

    // ************************ end ***********************


    // ************************ Manage WebSocket connection based on selected user ************************

    useEffect(() => {
        connectWebSocket();
        // Cleanup WebSocket on unmount
        return () => {
        if (socket) {
            socket.close();
            setSocket(null);
        }
        selectedUserRef.current = null;
        };
    }, []); // Runs once on component mount
    // ************************ end ***********************


    // ************************ Fetch friends when component mounts and clean up WebSocket on unmount ************************
    useEffect(() => {
        if (isAuth) {
            fetchFriends();
            fetchOnlineUsers(); // Fetch online users separately
        }
    }, [isAuth]);
    // ************************ end ***********************


    // ************************ Close the emoji picker when clicking outside ************************

    useEffect(() => {
		function handleClickOutside(event) {
		  if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
			setOpen(false);
		  }
		}
	
		if (open) {
		  document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
		  document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [open, setOpen]);
    
    // ************************ end ***********************

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        isChatVisible,
        handleUserClick,
        handleBackClick,
        allUsers,
        searchTerm,
        handleSearch,
        open,
        setOpen,
        text,
        setText,
        messages,
        handleSendMessage,
        handleEmojiClick,
        handleKeyPress,
        endRef,
        handleScroll,
        chatContainerRef,
        formatTime,
        typingUsers,
        emojiPickerRef,
        currentUser,
        onlineUsers,
        blockFriend,
        removeBlock,
        friendStatusRequests,
        }}
        >
        {children}
        </ChatContext.Provider>
    );
};

