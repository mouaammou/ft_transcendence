"use client";

import React, { createContext, useState, useEffect, useRef } from 'react';
import { getData } from '@/services/apiCalls';
// import usersData from '../data/users.json'
import { useAuth } from '@/components/auth/loginContext.jsx';


import { useDebounce } from 'use-debounce'; // Import from use-debounce




// somtimes : TypeError: Cannot read properties of null (reading 'useContext')

/// update 
// export const ChatContext = createContext({
    //   value: 'true',
    // });
    
    
// NEW 

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
    const [typingUsers, setTypingUsers] = useState([]); // Track users currently typingUb&Medkpro
    const [prevScrollHeight, setPrevScrollHeight] = useState(0); // To store the scroll height before fetching
    const [onlineUsers, setOnlineUsers] = useState([]); // Separate list for online users
    const [socket, setSocket] = useState(null); // WebSocket connection
    const [nextPage, setNextPage] = useState(null); // Store the next page URL
    const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
    const { profileData: currentUser } = useAuth(); // Current authenticated user
    const chatContainerRef = useRef(null); // Ref for the chat container
    const endRef = useRef(null); // Reference to scroll to bottom of chat
    const typingTimeoutRef = useRef(null); // To manage typing timeout
    const emojiPickerRef = useRef(null); // Reference for the emoji picker container
    const isFetchingRef = useRef(false); // To prevent multiple fetches at once
    const scrollTimeoutRef = useRef(null);
    const selectedUserRef = useRef(null);

    // ************************ end ***********************


    //  ************************  Handle search functionality  ************************

    // Update search term
    const handleSearch = (event) => {
        setSearchTerm(event.target.value); // Update the search term as the user types
    };

    // Effect to fetch friends when debounced search term changes
    useEffect(() => {
        fetchFriends(debouncedSearchTerm); // Only fetch when debouncedSearchTerm changes
    }, [debouncedSearchTerm]);

    // ************************ end ***********************


    // ************************ Helper Functions to structur message ************************

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to format date (e.g., "October 10, 2024")
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Group messages by date
    const groupMessagesByDate = (messagesList) => {
        const groupedMessages = {};

        messagesList.forEach(message => {
            const messageDate = formatDate(message.timestamp);

            // If this date doesn't exist in the groupedMessages, initialize it
            if (!groupedMessages[messageDate]) {
            groupedMessages[messageDate] = [];
            }

            // Add the message to the array for the specific date
            groupedMessages[messageDate].push(message);
        });

        return groupedMessages;
    };


    // ************************ end ***********************

    // ----------- the new mehode duplicate 1 in chat other no ----------------


    // const normalizeMessage = (message) => {
    //     // Normalize the message to ensure it has the same structure for comparison
    //     return {
    //         message: message.message,
    //         sender: message.sender,
    //         receiver: message.receiver,
    //         timestamp: new Date(message.timestamp).toISOString(), // Normalize to ISO string in UTC
    //     };
    // };
    
    const mergeAndSortMessages = (existing, incoming) => {
        const merged = { ...existing }; // Start with existing messages
        
        console.log('existing message before merge', existing);
        console.log('incoming message before merge', incoming);

        
        // Merge incoming messages
        for (const [date, newMessages] of Object.entries(incoming)) {
            const currentMessages = merged[date] || []; // Get existing messages for the date
            
            // Normalize both existing and new messages before comparing
            // const normalizedCurrentMessages = currentMessages.map(normalizeMessage);
            // const normalizedNewMessages = newMessages.map(normalizeMessage);


            // console.log('normalizedCurrentMessages', normalizedCurrentMessages);
            // console.log('normalizedNewMessages', normalizedNewMessages);
    
            // const combined = [
            //     ...normalizedCurrentMessages,
            //     ...normalizedNewMessages.filter(
            //         (newMessage) =>
            //             !normalizedCurrentMessages.some(
            //                 (existingMessage) =>
            //                     existingMessage.timestamp === newMessage.timestamp && 
            //                     existingMessage.message === newMessage.message &&
            //                     existingMessage.sender === newMessage.sender &&
            //                     existingMessage.receiver === newMessage.receiver
            //             )
            //     ),
            // ]; // Combine old and new messages without duplicates
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
        
        console.log('sortedMessages after merge', sortedMessages);
        return sortedMessages;
    };


    // Fetch chat history (handles both initial and pagination requests)
    const fetchChatHistory = async (receiver_id, page = 1) => {
        console.log('***** FetchChatHistoryi sFetchingRef.current   =>>', isFetchingRef.current)
        if (isFetchingRef.current) 
        {
            console.log("Fetch skipped: another fetch is in progress.");
            return; // Prevent multiple requests at once
        }
        try {
            isFetchingRef.current = true;
            console.log("Starting fetch for page:", page);

            const url = `/chat-history/${receiver_id}?page=${page}`;
            const response = await getData(url);


            
            // Check if the response is valid and contains results
            if (response.status === 200 && response.data.results) {
                const messagesList = response.data.results;
                const groupedMessages = groupMessagesByDate(messagesList);
                console.log('****** groupedMessages *** => ', groupedMessages)
                console.log('this is in fetchChatHistory');
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
                // Correctly update the nextPage state
                const nextPageUrl = response.data.next;
                const nextPageNumber = nextPageUrl
                    ? new URL(nextPageUrl).searchParams.get('page')
                    : null;
                setNextPage(nextPageNumber ? Number(nextPageNumber) : null);
                console.log("Next page set to:", nextPageNumber);
            }
            else {
                console.warn("No results in response or invalid response format.");
                setNextPage(null); // Explicitly set nextPage to null if no more pages
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
        //   // If the selected user is already the same, don't  Fetch chat history
            return;
        }

        setIsChatVisible(true);
        fetchChatHistory(user.id, 1); // Always start with page 1
        selectedUserRef.current = user; // Update the ref with the selected user
        // Reset nextPage for this user
        setNextPage(null);
        // Scroll to bottom after messages load
        setTimeout(() => {
            // if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
            scrollToEnd();
        }, 100);
        
        console.log('currentUser.username', currentUser.username);
        if (socket) {
            console.log('Sending mark_read to backend');
            // socket.send(JSON.stringify({ mark_read: true, receiver: user.username }));
            
            // add contact
            socket.send(JSON.stringify({ mark_read: true, contact: user.username }));
    

            //********************************************************************** */
            // Reset unread count for this user by setting unreadCount to 0 in last_message
            setAllUsers((prevUsers) =>
                prevUsers.map((friend) =>
                    friend.friend.id === user.id
                        ? {
                            ...friend,
                            last_message: {
                                ...friend.last_message,
                                is_read: true,
                                unreadCount: 0, // Reset unread count to 0
                            }
                        }
                        : friend
                )
            );

            //********************************************************************** */

            // last update

            // updateLastMessage(user.id, null, true, null); // Only update `is_read` for the selected user
        }

    };
    // ************************ end ***********************


    //  ************************  ************************
    const handleSendMessage = () => {
        console.log('Sending message...');
    
    // Log the current state of each condition
    console.log('Text:', text.trim());
    console.log('Socket:', socket);
    console.log('Socket Ready State:', socket ? socket.readyState : 'Socket is null');


    
    if (text.trim() && selectedUser && socket) {
        console.log('selectedUser.username =>' , selectedUser.username)
        const messageData = {
            sender: currentUser.username,
            receiver: selectedUser.username,
            message: text.trim(),
        };

      console.log('Sending message:', messageData);

      // Send the message via WebSocket to the backend
      socket.send(JSON.stringify(messageData));
  
      setText(''); // Clear input field

    }
    else {
        // Log why the message was not sent
        if (!text.trim()) console.log('Message not sent: Text is empty.');
        if (!selectedUser) console.log('Message not sent: No selected user.');
        if (!socket || socket.readyState !== WebSocket.OPEN) console.log('Message not sent: WebSocket is not open.');
    }

    };
    // ************************ end ***********************


    // ************************ Handle keypress event ************************

        //  ************************ Handle typing status ************************
        // Handle typing indication
        const handleTyping = () => {
            if (selectedUser && socket) {
                // console.log('is going to typing write now')
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
            }, 2000); // 2 seconds inactivity
        };


    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
        else {
            
            handleTyping(); // Indicate typing on key press
        }
    };
    // ************************ end ***********************

    // *********** end old methode ********

    const updateLastMessage = (userId, message, is_read, timestamp) => {
        setAllUsers((prevUsers) =>
            prevUsers.map((user) => {
                if (user.friend.id === userId) {
                    // Update unreadCount based on whether the message is read or unread
                    const unreadCount = is_read ? 0 : (user.last_message?.unreadCount || 0) + 1;
    
                    return {
                        ...user,
                        last_message: { 
                            message, 
                            is_read, 
                            timestamp, 
                            unreadCount // Place unreadCount inside last_message
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
        // If there's already an open WebSocket, close it before opening a new one
        console.log('If there is already an open WebSocket, close it before opening a new one');
        socket.close(); 
        }

        const ws = new WebSocket('ws://localhost:8000/ws/chat');

        ws.onopen = () => {
        console.log('WebSocket chat connected');
        };

        ws.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            const { sender, receiver, message, receiver_id, sender_id, typing , mark_read, contact , session_user} = receivedData;

            // Handle incoming messages
            if (message) {

                console.log('Incoming message:', message);
                // Check if the message should be marked as read immediately
                if (selectedUserRef.current)
                {
                    console.log("selectedUserRef.current.id => ", selectedUserRef.current.id );
                    console.log("sender_id =>", sender_id);
                }
                // console.log("currentUser.id in message => ", currentUser);
                // console.log("currentUser.id in message => ", currentUser.id);
                // console.log("receiver_id in message =>", receiver_id);
                // console.log("sender_id in message =>", sender_id);

                if (currentUser)
                {
                    console.log('in onmessage currentUser.username', currentUser.username);
                    console.log('in onmessage currentUser.username', currentUser.id);

                }
                else
                    console.log('currentUser is unnkown');
                // ****************************************************


                // Check if the message should be marked as read immediately
                if (selectedUserRef.current)
                    {
                        console.log("selectedUserRef.current.id => ", selectedUserRef.current.id );
                        console.log("sender_id =>", sender_id);
                    }
                    
                        console.log("currentUser.id => ", currentUser.id );
                        console.log("receiver_id =>", receiver_id);
    
                    // if (currentUser.id === receiver_id && selectedUserRef.current && selectedUserRef.current.id === sender_id) {
                    if (selectedUserRef.current && selectedUserRef.current.id === sender_id) {
                        // Mark the message as read since the receiver is actively viewing this chat
                        console.log("Marking message as read immediately.");
                        updateLastMessage(sender_id, message, true, receivedData.timestamp);
                    } else {
                        // Update last message as unread
                        updateLastMessage(sender_id, message, false, receivedData.timestamp);
                        console.log("we not Marking message as rea");
                    }
    
                    // Always update the sender's view of the receiver's last message
                    updateLastMessage(receiver_id, message, true, receivedData.timestamp);
                // ****************************************************

                // add new 
                // we have to change selectedUser?.id when we are aleady in the page contact replace selectedUser?.id with => contact 
                if (contact === sender)
                    scrollToEnd();

                // ------ last methode -----------------//
                setMessages((prevMessages) => {
                    // Use mergeAndSortMessages to update state and avoid duplicates
                    const updatedMessages = { ...prevMessages };

                    console.log('prevMessages in onmessage', prevMessages);
        
                    // Format the date of the message
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
        
                    console.log('Updated Messages:', updatedMessages);
                    return updatedMessages;
                });
            }

            //********************************************************************** */
            // handle userclick do mark_read
            if (mark_read && contact) {
                    console.log('Marking messages as read for receiver:', receiver);
                    updateLastMessage(sender_id, message, true, receivedData.timestamp); // Update sender's last_message
                
                    // updateLastMessage(sender_id, null, true, null); // Mark as read for sender
                }
                else {
                        console.log("Skipping mark_read update as conditions are not met.");
                }
            //********************************************************************** */
                    
                    // Handle typing indicator
            if (typing)
            {
                // console.log('typing => ', typing)
                if (!typingUsers.includes(sender)) {
                    setTypingUsers((prev) => [...prev, sender]);
                }
            } else {
                    setTypingUsers((prev) => prev.filter(user => user !== sender));
            }
        };


        ws.onclose = (event) => {
        console.log(event);
        console.log('WebSocket chat disconnected');
        };

        ws.onerror = (error) => {
        console.error('WebSocket chat error:', error);
        };

        setSocket(ws);
    };
    // ************************ end ***********************


    //  ************************ handle emoji selection and append the selected emoji to the message text ************************
        const handleEmojiClick = emoji => {
        setText(prev => prev + emoji.emoji);
        // if i want select just one emogi -> setOpen(false)
        // setOpen(false);
    };
    // ************************ end ***********************


    //  ************************ handle back button click, hide the chat component on smaller screens ************************
    const handleBackClick = () => {
        setIsChatVisible(false);
    };
    // ************************ end ***********************


    // ************************  Fetch friends (users to chat with) ************************
    const fetchFriends = async (search = '') => {
        try {
            const url = `/chat-friends?search=${search}`;
            const response = await getData(url);
            
            if (response.status === 200) {
                // console.log('response => ', response)
                console.log('response.data => ', response.data)
                // const newUsers = response.data.results;
                const newUsers = response.data;
    
                // Reset user lists when fetching with a new search term
                if (!search) {
                    // Store the full list for reference only when not searching
                    setOriginalUsers(newUsers);
                }
                setAllUsers(newUsers);
                // console.log('users => ', allUsers)
                // setNextPage(null); // Clear next page state as it's no longer used
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Failed to fetch friends:", error);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            const url = `/chat-friends`;
            const response = await getData(url);

            if (response.status === 200) {
                setOnlineUsers(response.data); // Update only online users
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Failed to fetch online users:", error);
        }
    };

    // ************************ end ***********************

 // Function to handle fetching and restoring scroll
    const handleFetchOlderMessages = async () => {
        // if (isFetchingRef.current || !nextPage) {
        if (!nextPage) {
            console.log("Skipping fetch: isFetchingRef.current =", isFetchingRef.current, ", nextPage =", nextPage);
            return;
        }

        console.log("teeesssssttttt heeereeee");
            
        const chatContainer = chatContainerRef.current;
        
        // Save the current scroll height before fetching
        setPrevScrollHeight(chatContainer.scrollHeight);
        
        try {
            await fetchChatHistory(selectedUser.id, nextPage);
            // Restore scroll position to the first newly fetched message
            const scrollDelta = chatContainer.scrollHeight - prevScrollHeight;
            chatContainer.scrollTop = scrollDelta; // Adjust scroll to compensate for new content
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
        } finally {
            isFetchingRef.current = false; // Allow further fetches
            console.log("Fetch completed, isFetchingRef.current reset to:", isFetchingRef.current);
        }
    };


    const handleScroll = (event) => {
        const chatContainer = event.target;

        // if (scrollTimeout) clearTimeout(scrollTimeout);
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Set a new timeout to fetch the next page after a delay (e.g., 300ms)
        // scrollTimeout = setTimeout(() => {
        scrollTimeoutRef.current = setTimeout(() => {
            if (chatContainer.scrollTop <= 50) {
                handleFetchOlderMessages();
            }
        }, 300); // Debounce interval (300ms)
    };


    // ************************ end ***********************


    // ************************ Scroll to the end of the messages ************************
    // useEffect(() => {
    //     if (endRef.current) {
    //     // endRef.current.scrollIntoView({ behavior: 'smooth' });
    //     endRef.current?.scrollIntoView({ behavior: 'auto' });
    //     }
    // }, [messages, selectedUser]); // Trigger on messages or user change

    useEffect(() =>{
        scrollToEnd();
    }, [messages])
    // new  methode 
    const scrollToEnd = () => {
        if (endRef.current)
            endRef.current.scrollIntoView({ behavior: "smooth" });
    };

    // ************************ end ***********************


    // ************************ Manage WebSocket connection based on selected user ************************
    useEffect(() => {
        connectWebSocket(); // Connect to WebSocket for general chat
        // Cleanup WebSocket on unmount
        return () => {
        if (socket) {
            socket.close(); // Clean up WebSocket on unmount
            console.log("WebSocket is closed");
            setSocket(null); // Reset socket state
        }
        };
    }, []); // Runs once on component mount
    // ************************ end ***********************


    // ************************ Fetch friends when component mounts and clean up WebSocket on unmount ************************
    useEffect(() => {
        fetchFriends();
        fetchOnlineUsers(); // Fetch online users separately
        console.log('currentUser hous connecting =>', currentUser);
    }, []);
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
	
		// Cleanup event listener on component unmount or when `open` changes
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
        // onlineUser,
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
        onlineUsers
        }}
        >
        {children}
        </ChatContext.Provider>
    );
};
