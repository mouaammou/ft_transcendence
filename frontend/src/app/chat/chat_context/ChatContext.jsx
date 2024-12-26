'use client';

import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { deleteData, getData , postData} from '@/services/apiCalls';
import { useAuth } from '@/components/auth/loginContext.jsx';


import { useDebounce } from 'use-debounce';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import { all } from 'axios';
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

    const [friendStatusRequest, setFriendStatusRequest] = useState(null);
    const [removeBlockedUser, setRemoveBlockedUser] = useState('');

    // ************************ end ***********************

    const {
		users,
		setUsers,
        lastMessage,
        isConnected,
	} = useWebSocketContext();

    // ************************  Fetch friends (users to chat with) ************************
    const fetchFriends = async (search = '') => {
        try {
            const url = `/chat-friends?search=${search}`;
            const response = await getData(url);
            
            if (response.status === 200) {
                console.log('response.data => ', response.data)
                const newUsers = response.data;
                if (!search) {
                    setOriginalUsers(newUsers);
                }
                setAllUsers(newUsers);
                console.log('newUsers => ', newUsers);
            }
            // Handle unauthorized response
            else if (response.status === 401) {
                // Handle unauthorized response
                console.error("Unauthorized access ");
            } 
            else {
                console.error(" ****** Unexpected response status:", response);
            }
        } catch (error) {
            console.error("Failed to fetch friends:", error);
        }
    };

    // ************************  Fetch fetchOnlineUsers ************************

     const fetchOnlineUsers = () => {
        console.log('originalUsers => ', originalUsers);
        const onlineUsers = originalUsers.filter(user => user.friend && user.friend.status === 'online');
        console.log('onlineUsers => ', onlineUsers);
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
                    console.log('WebSocket ONLINE STATUS:', data);
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
                console.error('Error in handleOnlineStatus:', error);
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
            console.log("Fetch skipped: another fetch is in progress.");
            return; // Prevent multiple requests at once
        }
        try {
            isFetchingRef.current = true;
            const url = `/chat-history/${receiver_id}?page=${page}`;
            const response = await getData(url);

            if (response.status === 200 && response.data.results) {
                const messagesList = response.data.results;
                const groupedMessages = groupMessagesByDate(messagesList);
                console.log('****** groupedMessages *** => ', groupedMessages)
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
                console.log("Next page set to:", nextPageNumber);
            }
            else {
                console.warn("No results in response or invalid response format.");
                setNextPage(null);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            isFetchingRef.current = false;
            console.log("Fetch completed, isFetchingRef.current reset to false.");
        }
    };
    
    // ************************ end ***********************


    //  ************************ Handle user click (select a chat) ************************

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsChatVisible(true);
        if (selectedUser && selectedUser.id === user.id) {
            return;
        }

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

        const selectedUserStatus = allUsers.find((friend) => friend.friend.id === user.id)?.friend.friendship_status;
        if (selectedUserStatus === 'blocking')
            setRemoveBlockedUser('blocking');
        else if (selectedUserStatus === 'blocked')
            setRemoveBlockedUser('blocked');
        console.log('****** selectedUserStatus => ', selectedUserStatus);
        if (selectedUserStatus === 'blocking' || selectedUserStatus === 'blocked')
        {

            console.log('****** setFriendStatusRequest is  blocked => ');
            setFriendStatusRequest('blocked');
        }
        else
        {
            console.log('****** setFriendStatusRequest is  accepted => ');
            setFriendStatusRequest('accepted');
        }
    };
    // ************************ end ***********************

    // *********** block friends ********

    const blockFriend = useCallback(() => {
        console.log('selectedUser.id in blockFriend => ', selectedUserRef.current?.id)
        if (selectedUserRef.current?.id && friendStatusRequest !== 'blocked')
            postData(`/blockFriend/${selectedUserRef.current.id}`)
                .then((response) => {
                    if (response.status === 200 && response.data?.status == 'blocking') {
                        console.log(" ** response => ", response.data);
                        setFriendStatusRequest('blocked');
                        setRemoveBlockedUser('blocking');
                        setAllUsers((prevUsers) =>
                            prevUsers.map((friend) =>
                                friend.friend.id === selectedUserRef.current.id
                                    ? {
                                        ...friend,
                                        friend: {
                                            ...friend.friend,
                                            friendship_status: 'blocked',
                                        },
                                    }
                                    : friend
                            )
                        );
                    }
                    else if (response.status === 200 && response.data?.status == 'already') {
                        setFriendStatusRequest('blocked');
                        setRemoveBlockedUser('blocked');
                    }
                    else {
                        console.log('Failed to block friend, response status:', response);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Error blocking friend:', error);
                });

    }, [selectedUserRef.current?.id]);


    const removeBlock = useCallback(() => {
        console.log('selectedUser.id in removeBlock => ', selectedUserRef.current?.id)
        if (selectedUserRef.current?.id)
            deleteData(`/removeBlock/${selectedUserRef.current.id}`)
                .then((response) => {
                    if (response.status === 200) {
                        setFriendStatusRequest('accepted');
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
                    else {
                        console.log('Failed to remove block, response status:', response);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Error removing block:', error);
                });

    }, [selectedUserRef.current?.id]);
    // *********** end block friends ********

  //  ************************  ************************
  const handleSendMessage = () => {
    console.log('Sending message...');


    // if (text.trim() && selectedUser && socket && socket.readyState === WebSocket.OPEN) {
    if (text.trim() && selectedUser && socket) {
        console.log('selectedUser.username =>' , selectedUser.username)
        const messageData = {
            sender: currentUser.username,
            receiver: selectedUser.username,
            message: text.trim(),
        };

      console.log('Sending message:', messageData);

      socket.send(JSON.stringify(messageData));

      setText('');
    }
    else {
        if (!text.trim()) console.log('Message not sent: Text is empty.');
        if (!selectedUser) console.log('Message not sent: No selected user.');
        if (!socket || socket.readyState !== WebSocket.OPEN) console.log('Message not sent: WebSocket is not open.');
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
        
        if (friendStatusRequest === 'blocked') {
            console.log('Message not sent: The selected user is blocked.');
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
        else {
            
            handleTyping();
        }
    };
    // ************************ end ***********************

    // *********** end old methode ********

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
        console.log('If there is already an open WebSocket, close it before opening a new one');
        socket.close(); 
        }else {
            console.log('WebSocket is not open');
        }

        const ws = new WebSocket('ws://localhost:8000/ws/chat');

        ws.onopen = () => {
        console.log('WebSocket chat connected');
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
                        console.log('Socket:', ws);
                        console.log('Socket Ready State:', ws ? ws.readyState : 'Socket is null');                          
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
        console.log(event);
        console.log('WebSocket chat disconnected');
        };

        ws.onerror = error => {
        console.error('WebSocket chat error:', error);
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
            console.log("Skipping fetch: isFetchingRef.current =", isFetchingRef.current, ", nextPage =", nextPage);
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
            console.error("Failed to fetch chat history:", error);
        } finally {
            isFetchingRef.current = false;
            console.log("Fetch completed, isFetchingRef.current reset to:", isFetchingRef.current);
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
            console.log('WebSocket is closed');
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
        friendStatusRequest,
        removeBlockedUser,
        setRemoveBlockedUser,
        }}
        >
        {children}
        </ChatContext.Provider>
    );
};

