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

    // const [onlineUser, setOnlineUser] = useState([]);  // we don't alredy use it  setOnlineUser

    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [messages, setMessages] = useState({});
    const [socket, setSocket] = useState(null); // WebSocket connection
    // const [userCount, setUserCount] = useState(0);
    const { profileData: currentUser } = useAuth(); // Current authenticated user
    // const [nextPage, setNextPage] = useState(null); // Store the next page URL
    const endRef = useRef(null); // Reference to scroll to bottom of chat
    const [typingUsers, setTypingUsers] = useState([]); // Track users currently typingUb&Medkpro
    const typingTimeoutRef = useRef(null); // To manage typing timeout
    const emojiPickerRef = useRef(null); // Reference for the emoji picker container


    const [nextPage, setNextPage] = useState(null); // Store the next page URL

    const isFetchingRef = useRef(false); // To prevent multiple fetches at once
    const scrollTimeoutRef = useRef(null);

    const chatContainerRef = useRef(null); // Ref for the chat container
    const [prevScrollHeight, setPrevScrollHeight] = useState(0); // To store the scroll height before fetching
    const [debouncedSearchTerm] = useDebounce(searchTerm, 400); // Delay of 300ms


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



     // ************************ Helper Functions ************************

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


    //  ************************ Fetch chat history ************************

    // const fetchChatHistory = async (receiver_id) => {
    //     try {
    //       console.log("Fetching chat history for user:", receiver_id);
    //       const response = await getData(`/chat-history/${receiver_id}`);
    //       if (response.status === 200) {
    //         const groupedMessages = groupMessagesByDate(response.data); // Grouping messages by date
    //         console.log('groupedMessages => ', groupedMessages)
    //         setMessages((prevMessages) => ({
    //           ...prevMessages,
    //           [receiver_id]: groupedMessages, // Store grouped chat history under the receiver's ID
    //         }));
    //       }
    //     } catch (error) {
    //       console.error('Error fetching chat history:', error);
    //     }
    //   };

    const mergeAndSortMessages = (existing, incoming) => {
        const merged = { ...existing }; // Start with existing messages
    
        // Merge incoming messages
        for (const [date, newMessages] of Object.entries(incoming)) {
            const currentMessages = merged[date] || []; // Get existing messages for the date
            const combined = [...currentMessages, ...newMessages]; // Combine old and new messages
    
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
                if (page === 1) {
                    setMessages((prevMessages) => ({
                        ...prevMessages,
                        [receiver_id]: mergeAndSortMessages(prevMessages[receiver_id] || {}, groupedMessages),
                    }));
                } else {
                    setMessages((prevMessages) => ({
                        ...prevMessages,
                        [receiver_id]: mergeAndSortMessages(prevMessages[receiver_id] || {}, groupedMessages),
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

        console.log("******************** user component in handleUserClick: ***** ", user.id);
        if (selectedUser && selectedUser?.id ) {
            console.log("******************** selectedUser after initialize it in handleUserClick: ***** ", selectedUser.id);
        }
        else
            console.log("******************** selectedUser is not initialized yet in handleUserClick: ***** ");

        if (selectedUser && selectedUser.id === user.id) {
        //   // If the selected user is already the same, don't  Fetch chat history
        return;
        }

        // fetchChatHistory(user.id, 1, false); // Fetch chat history for selected user
        // setNextPage(null); // Reset nextPage for the selected user
        // fetchChatHistory(user.id, 1);
        fetchChatHistory(user.id, 1); // Always start with page 1

        // Reset nextPage for this user
        setNextPage(null);

        // add new
        // Scroll to bottom after messages load
        setTimeout(() => {
            if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
        }, 100);

        if (socket) {
            console.log('Sending mark_read to backend');
            socket.send(JSON.stringify({ mark_read: true, receiver: user.username }));
    
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

    // *******  old methode ****** 
    // Update the `last_message` field in `allUsers` when a new message is sent or received
    // const updateLastMessage = (userId, message, is_read, timestamp) => {
    //     setAllUsers((prevUsers) =>
    //         prevUsers.map((user) =>
    //             user.friend.id === userId
    //                 ? { ...user, last_message: { message, is_read, timestamp } }
    //                 : user
    //         )
    //     );
    // };

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
            const { sender, receiver, message, receiver_id, sender_id, typing , mark_read} = receivedData;

            // Handle incoming messages
            if (message) {

                console.log('Incoming message:', message);
                
                setMessages((prevMessages) => {
                    const updatedMessages = { ...prevMessages };
        
                    // Ensure that both sender and receiver messages are updated correctly
                    if (!updatedMessages[sender_id]) {
                        updatedMessages[sender_id] = {};
                    }
        
                    if (!updatedMessages[receiver_id]) {
                        updatedMessages[receiver_id] = {};
                    }
        
                    const messageDate = formatDate(receivedData.timestamp);
        
                    // Add message to the correct date bucket for both sender and receiver
                    if (!updatedMessages[sender_id][messageDate]) {
                        updatedMessages[sender_id][messageDate] = [];
                    }
        
                    if (!updatedMessages[receiver_id][messageDate]) {
                        updatedMessages[receiver_id][messageDate] = [];
                    }
        
                    updatedMessages[sender_id][messageDate].push(receivedData); // Sender's message
                    updatedMessages[receiver_id][messageDate].push(receivedData); // Receiver's message
                    
                    console.log('Updated Messages:', updatedMessages);
                    return updatedMessages;
                });

                // // Update last message for both sender and receiver
                // updateLastMessage(sender_id, message, false, receivedData.timestamp);
                // updateLastMessage(receiver_id, message, true, receivedData.timestamp);


                // Check if the message should be marked as read immediately
                if (selectedUser)
                    console.log('******************** selectedUser.id in on message ************************* ', selectedUser.id)
                else
                    console.log('**** \\\ selectedUser is not exist in on message \\\ ****')
                console.log('******************** sender_id in on message *************************', sender_id)
                if (currentUser.id === receiver_id && selectedUser && selectedUser.id === sender_id) {
                    // Mark the message as read since the receiver is actively viewing this chat
                    console.log("Marking message as read immediately.");
                    updateLastMessage(sender_id, message, true, receivedData.timestamp);
                } else {
                    // Update last message as unread
                    updateLastMessage(sender_id, message, false, receivedData.timestamp);
                }

                // Always update the sender's view of the receiver's last message
                updateLastMessage(receiver_id, message, true, receivedData.timestamp);

                // add new 
                // we have to change selectedUser?.id when we are aleady in the page contact replace selectedUser?.id with => contact 
                if (selectedUser?.id === sender_id)
                    scrollToEnd();
                // add new 
                // we have to change selectedUser?.id when we are aleady in the page contact replace selectedUser?.id with => contact
            }

            if (mark_read && receiver) {
                console.log('Marking messages as read for receiver:', receiver);
                updateLastMessage(sender_id, message, true, receivedData.timestamp); // Update sender's last_message
                
                // updateLastMessage(sender_id, null, true, null); // Mark as read for sender
            }
            else {
                console.log("Skipping mark_read update as conditions are not met.");
            }

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
    // const fetchFriends = async (page = 1, search = '') => {
    //     try {
    //         // Send the search term to the backend, if available
    //         const url = `/chat-friends?page=${page}&search=${search}`;
    //         const response = await getData(url);

    //         if (response.status === 200) {
    //             const newUsers = response.data.results;

    //             // If we're fetching a new search term, reset the user lists
    //             if (page === 1) {
    //                 setOriginalUsers(newUsers);
    //                 setAllUsers(newUsers);
    //             } else {
    //                 // Append new users to the current list (for infinite scroll)
    //                 setOriginalUsers((prev) => [...prev, ...newUsers]);
    //                 setAllUsers((prev) => [...prev, ...newUsers]);
    //             }

    //             setNextPage(response.data.next); // Set the next page URL
    //         } else {
    //             console.error("Unexpected response status:", response.status);
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch friends:", error);
    //     }
    // };

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
                setOriginalUsers(newUsers);
                setAllUsers(newUsers);
                console.log('users => ', allUsers)
                // setNextPage(null); // Clear next page state as it's no longer used
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Failed to fetch friends:", error);
        }
    };


    // ************************ end ***********************


    // ************* old  Handle scrolling to fetch more users (Infinite scroll) ************
    // const handleScroll = (event) => {
    //     const { scrollTop, scrollHeight, clientHeight } = event.target;
    //     if (scrollHeight - scrollTop === clientHeight) {
    //     // We're at the bottom of the list, so load the next page
    //     if (nextPage) {
    //         const page = new URL(nextPage).searchParams.get('page'); // Extract the next page number from the URL
    //         fetchFriends(page);
    //     }
    //     }
    // };



     // ************************ new  Handle scroll for infinite scrolling ************************
    //  const handleScroll = (event) => {
    //     const { scrollTop, scrollHeight, clientHeight } = event.target;

    //     // If scrolled to the bottom, do nothing
    //     if (scrollTop + clientHeight >= scrollHeight - 5) {
    //         return;
    //     }

    //     // If user is near the top and there is a next page to fetch
    //     if (scrollTop <= 50 && !isFetchingRef.current && nextPage && selectedUser) {
    //         console.log('** IS REACH TO THE TOP CALL TO fetchChatHistory');
    //         console.log('*** nextPage ', nextPage)
    //         if (scrollTimeoutRef.current) {
    //             clearTimeout(scrollTimeoutRef.current);
    //         }

    //          // Set a new timeout to fetch the next page after a delay (e.g., 500ms)
    //         scrollTimeoutRef.current = setTimeout(() => {
    //         // Clear previous timeout if any
    //         // methode 2 
    //         // const nextPageUrl = nextPage ? `/chat-history/${selectedUser.id}?page=${nextPage}` : null;
    //         // if (nextPageUrl) {
    //         //     fetchChatHistory(selectedUser.id, nextPage); // Fetch next page of messages
    //         // }

    //             fetchChatHistory(selectedUser.id, nextPage); // Fetch next page of messages
    //         }, 500); // Timeout delay in milliseconds (e.g., 500ms)
    //     }
    // };

 // Function to handle fetching and restoring scroll
    const handleFetchOlderMessages = async () => {
        // if (isFetchingRef.current || !nextPage) {
        if (!nextPage) {
            console.log("Skipping fetch: isFetchingRef.current =", isFetchingRef.current, ", nextPage =", nextPage);
            return;
        }
            
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

    // new  methode 
    const scrollToEnd = () => {
        if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
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
        // getChatId,

        formatTime,
        typingUsers,
        emojiPickerRef,
        currentUser
        // groupMessagesByDate
        }}
        >
        {children}
        </ChatContext.Provider>
    );
};
