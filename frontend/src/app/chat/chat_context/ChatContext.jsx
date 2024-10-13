"use client";

import React, { createContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getData } from '@/services/apiCalls';
// import usersData from '../data/users.json'
import { useAuth } from '@/components/auth/loginContext.jsx';




/// update 

export const ChatContext = createContext({
  value: 'true',
});

export const ChatProvider = ({ children }) => {

  // All useState hooks
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const [onlineUser, setOnlineUser] = useState([]);  // we don't alredy use it  setOnlineUser

  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState({});
  const [socket, setSocket] = useState(null); // WebSocket connection
  const [userCount, setUserCount] = useState(0);
  const { profileData: currentUser } = useAuth(); // Current authenticated user



  const endRef = useRef(null); // Reference to scroll to bottom of chat

  // Handle search functionality
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      // Reset to full list if search term is cleared
      setAllUsers(originalUsers);
    } else {
      // Filter based on search term
      const filtered = originalUsers.filter((user) =>
        user.username.toLowerCase().includes(term)
      );
      setAllUsers(filtered);
    }
  };

  // Fetch chat history
  const fetchChatHistory = async (receiver_id) => {
    try {
      console.log("Fetching chat history for user:", receiver_id);
      const response = await getData(`/chat-history/${receiver_id}`);
      console.log('fetchChatHistory  response ->',response)
      if (response.status === 200) {
        // Update messages state with the fetched chat history
        setMessages((prevMessages) => ({
          ...prevMessages,
          [receiver_id]: response.data, // Store chat history under the receiver's ID
        }));
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  // Handle user click (select a chat)
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
  };

  const handleSendMessage = () => {
    console.log('Sending message...');
  
  // Log the current state of each condition
  console.log('Text:', text.trim());
  console.log('Selected User:', selectedUser);
  console.log('Socket:', socket);
  console.log('Socket Ready State:', socket ? socket.readyState : 'Socket is null');

  // if (!socket || socket.readyState !== WebSocket.OPEN) {
  //   console.log('WebSocket is not open, reconnecting...');
  //   connectWebSocket(); // Reconnect WebSocket if it's closed
  //   return; // Wait for the WebSocket to reconnect
  // }

  // if (!socket || socket.readyState !== WebSocket.OPEN) {
  //   console.log('WebSocket is not open, reconnecting...');
  //   connectWebSocket(); // Reconnect WebSocket if it's closed
  //   return; // Wait for the WebSocket to reconnect
  // }

    // if (text.trim() && selectedUser && socket && socket.readyState === WebSocket.OPEN) {
    //   const messageData = {
    //     sender: currentUser.username,  // Send the username, not ID
    //     receiver: selectedUser.username,
    //     message: text.trim(),
    //   };

    if (text.trim() && selectedUser && socket) {
      const messageData = {
        sender: currentUser.username,  // Send the username, not ID
        receiver: selectedUser.username,
        message: text.trim(),
      };

      console.log('Sending message:', messageData);

      // Send the message via WebSocket to the backend
      socket.send(JSON.stringify(messageData));
  
      // Update the local state with the new message
      // setMessages((prevMessages) => {
      //   const updatedMessages = { ...prevMessages };
      //   if (!updatedMessages[selectedUser.id]) {
      //     updatedMessages[selectedUser.id] = [];
      //   }

        // updatedMessages[selectedUser.id].push(messageData); // Add message locally


        // return updatedMessages;

      // });
  
      setText(''); // Clear input field

    }

  };
  
  

  // Handle keypress event (send message on "Enter" key)
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };


  const connectWebSocket = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // If there's already an open WebSocket, close it before opening a new one
      socket.close(); 
    }

    const ws = new WebSocket('ws://localhost:8000/ws/chat');

    ws.onopen = () => {
      console.log('WebSocket chat connected');
    };

    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      const { sender, receiver, message, receiver_id, sender_id, timestamp} = receivedData;
  
      console.log('receivedData => ', receivedData);


  
      // Update the local state with the received message
      setMessages((prevMessages) => {
          const updatedMessages = { ...prevMessages };
          
          // Check if the current user is the sender or receiver and set userId accordingly
          let userId;
          if (sender_id === currentUser.id) {
              // If the current user is the sender, use the receiver_id
              userId = receiver_id;
          } else {
              // If the current user is the receiver, use the sender_id
              userId = sender_id;
          }
  
          // Alternatively, you can directly use selectedUser.id if it's already known:
          // userId = selectedUser.id;
  
          // Initialize the message array for this user if it doesn't exist
          if (!updatedMessages[userId]) {
              updatedMessages[userId] = [];
          }
  
          // Add the new message to the array
          updatedMessages[userId].push(receivedData);

          // console.log('updatedMessages => ', updatedMessages)
  
          return updatedMessages;
        });
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
  // add


  // Function to handle emoji selection and append the selected emoji to the message text
    const handleEmojiClick = emoji => {
    setText(prev => prev + emoji.emoji);
    // if i want select just one emogi -> setOpen(false)
    // setOpen(false);
  };


  // Function to handle back button click, hide the chat component on smaller screens
  const handleBackClick = () => {
    setIsChatVisible(false);
  };

  // Fetch friends (users to chat with)
  const fetchFriends = async () => {
    try {
      const response = await getData("/chat-friends");
      if (response.status === 200) {
        const newUsers = response.data.results;
        setOriginalUsers(newUsers);
        setAllUsers(newUsers);
        setUserCount(newUsers.length);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  };

  
  // Scroll to the end of the messages whenever messages or selectedUser changes
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUser]); // Trigger on messages or user change
  


  // add
  // Manage WebSocket connection based on selected user
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
  // add

  
  // Fetch friends when component mounts and clean up WebSocket on unmount
  useEffect(() => {
    fetchFriends();
  }, []);
  
  return (
    <ChatContext.Provider
    value={{
      selectedUser,
      isChatVisible,
      handleUserClick,
      handleBackClick,
      onlineUser,
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
      // getChatId,
    }}
    >
      {children}
    </ChatContext.Provider>
  );
};
