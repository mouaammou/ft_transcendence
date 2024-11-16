"use client";

import React, { createContext, useState, useEffect, useRef } from 'react';
import { getData } from '@/services/apiCalls';
// import usersData from '../data/users.json'
import { useAuth } from '@/components/auth/loginContext.jsx';






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
    const [typingUsers, setTypingUsers] = useState([]); // Track users currently typing
    const typingTimeoutRef = useRef(null); // To manage typing timeout
    const emojiPickerRef = useRef(null); // Reference for the emoji picker container

    // ************************ end ***********************



    //  ************************  Handle search functionality  ************************
     const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        // Fetch the users based on the search term, starting from page 1
        // fetchFriends(1, term);
        fetchFriends(term);
    };


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

    const fetchChatHistory = async (receiver_id) => {
        try {
          console.log("Fetching chat history for user:", receiver_id);
          const response = await getData(`/chat-history/${receiver_id}`);
          if (response.status === 200) {
            const groupedMessages = groupMessagesByDate(response.data); // Grouping messages by date
            console.log('groupedMessages => ', groupedMessages)
            setMessages((prevMessages) => ({
              ...prevMessages,
              [receiver_id]: groupedMessages, // Store grouped chat history under the receiver's ID
            }));
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
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
        
        // setSelectedUser(user);
        // setIsChatVisible(true);
        fetchChatHistory(user.id); // Fetch chat history for selected user


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


    // last update

    // const updateLastMessage = (userId, message, is_read, timestamp) => {
    //     setAllUsers((prevUsers) =>
    //         prevUsers.map((user) => {
    //             if (user.friend.id === userId) {
    //                 const unreadCount = is_read ? 0 : (user.last_message?.unreadCount || 0) + 1;
    //                 return {
    //                     ...user,
    //                     last_message: {
    //                         ...user.last_message,
    //                         message: message || user.last_message?.message, // Preserve previous message if not provided
    //                         is_read,
    //                         timestamp: timestamp || user.last_message?.timestamp, // Preserve timestamp if not provided
    //                         unreadCount,
    //                     },
    //                 };
    //             }
    //             return user;
    //         })
    //     );
    // };
    
    // ************************ end ***********************

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
            
        
                //  new


            //     setMessages((prevMessages) => {
            //         const updatedMessages = { ...prevMessages };

            //         // Ensure the structure for the receiver exists
            //         if (!updatedMessages[receiver_id]) {
            //             updatedMessages[receiver_id] = {};
            //         }

            //         // Determine the date of the message
            //         const messageDate = formatDate(receivedData.timestamp);

            //         // Ensure the structure for the date exists
            //         if (!updatedMessages[receiver_id][messageDate]) {
            //             updatedMessages[receiver_id][messageDate] = [];
            //         }

            //         // Append the new message to the correct date group
            //         updatedMessages[receiver_id][messageDate].push(receivedData);

            //         console.log('Updated Messages:', updatedMessages);
            //         return updatedMessages;
            //     });


            //     if (sender_id === currentUser.id) {
            //         updateLastMessage(receiver_id, message, false, receivedData.timestamp); // Sent message, mark as read for sender
            //     } else {
            //         updateLastMessage(sender_id, message, false, receivedData.timestamp); // Received message, mark as unread for receiver
            //     }
                
            // }

            // console.log(' mark_read befor condition => ', mark_read)
            // console.log(' this is receiver  => ', receiver)
            // if (mark_read && receiver) {
            //     // Update the read status of messages from this user
            //     console.log(' mark_read inside condition => ', mark_read)
            //     setAllUsers((prevUsers) =>
            //         prevUsers.map((friend) => {
            //             if (friend.username === receiver) {
            //                 // Update the `is_read` status of the `last_message`
            //         return {
            //             ...friend,
            //             last_message: {
            //                 ...friend.last_message,
            //                 is_read: true
            //             }
            //         };
            //             }
            //             return friend;
            //         })
            //     );
            //     updateLastMessage(sender_id, message, true, receivedData.timestamp); // Update sender's last_message
            // }


            //   last update 

                console.log('Incoming message:', message);


                const isSender = sender_id === currentUser.id;
                const targetId = isSender ? receiver_id : sender_id;

                // Update messages for the selected user
                // setMessages((prevMessages) => {
                // const updatedMessages = { ...prevMessages };

                // if (!updatedMessages[targetId]) {
                //     updatedMessages[targetId] = {};
                // }

                // const messageDate = formatDate(receivedData.timestamp);

                // if (!updatedMessages[targetId][messageDate]) {
                //     updatedMessages[targetId][messageDate] = [];
                // }

                // updatedMessages[targetId][messageDate].push(receivedData);

                // // Special case: if the sender is the current user, update their messages too
                // // Ensure the message also appears for the sender immediately
                // // if (isSender) {
                // //     const senderMessages = updatedMessages[currentUser.id] || {};
                // //     if (!senderMessages[messageDate]) {
                // //     senderMessages[messageDate] = [];
                // //     }
                // //     senderMessages[messageDate].push(receivedData);
                // //     updatedMessages[currentUser.id] = senderMessages;
                // // }

                // console.log('Updated Messages:', updatedMessages);
                // return updatedMessages;
                // });


                //   ---------- the last  new -------------
                
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

                // Update last message for both sender and receiver
                updateLastMessage(sender_id, message, false, receivedData.timestamp);
                updateLastMessage(receiver_id, message, false, receivedData.timestamp);
            }

            if (mark_read && receiver) {
                console.log('Marking messages as read for receiver:', receiver);

                // Mark messages as read for the receiver
                // setAllUsers((prevUsers) =>
                //     prevUsers.map((friend) => {
                //         if (friend.username === receiver) {
                //             return {
                //                 ...friend,
                //                 last_message: {
                //                     ...friend.last_message,
                //                     is_read: true,
                //                     unreadCount: 0,
                //                 },
                //             };
                //         }
                //         return friend;
                //     })
                // );

                
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


    // ************* Handle scrolling to fetch more users (Infinite scroll) ************
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
    // ************************ end ***********************


    // ************************ Scroll to the end of the messages ************************
    useEffect(() => {
        if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, selectedUser]); // Trigger on messages or user change
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
        // handleScroll,
        // getChatId,

        formatTime,
        typingUsers,
        emojiPickerRef,
        // groupMessagesByDate
        }}
        >
        {children}
        </ChatContext.Provider>
    );
};
