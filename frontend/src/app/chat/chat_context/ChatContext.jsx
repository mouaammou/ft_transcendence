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
  const [onlineUser, setOnlineUser] = useState([]);
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


    // const messageData = {
    //   sender: currentUser.username, // Send the username
    //   receiver: selectedUser.username,
    //   message: text.trim(),
    // };

      console.log('Sending message:', messageData);
      // Send the message via WebSocket
      socket.send(JSON.stringify(messageData));
  
      // Update the local state with the new message
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        if (!updatedMessages[selectedUser.id]) {
          updatedMessages[selectedUser.id] = [];
        }
        updatedMessages[selectedUser.id].push(messageData); // Add message locally
        return updatedMessages;
      });
  
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

  // Connect to WebSocket
  // const connectWebSocket = (receiver_id) => {
  //   if (socket && socket.readyState === WebSocket.OPEN) {
  //     // If there's already an open WebSocket, close it before opening a new one
  //     socket.close(); 
  //   }

  //   if (receiver_id) {
  //     const ws = new WebSocket(`ws://localhost:8000/ws/chat/${receiver_id}`);

  //     ws.onopen = () => {
  //       console.log('WebSocket chat connected');
  //     };

  //     ws.onmessage = (event) => {
  //       console.log('event of message');
  //       console.log('event', event);
  //       const receivedData = JSON.parse(event.data);
  //       // const { sender, receiver, text } = receivedData;
  //       const { sender, receiver, message } = receivedData;
  //       console.log('the is onmessage receivedData -> ',receivedData)

  //       // Update the local state with the received message
  //       setMessages((prevMessages) => {
  //         const updatedMessages = { ...prevMessages };
  //         const userId = sender === currentUser.username ? receiver : sender;

  //         if (!updatedMessages[userId]) {
  //           updatedMessages[userId] = [];
  //         }
  //         updatedMessages[userId].push(receivedData);
  //         return updatedMessages;
  //       });

  //     };
      



  //     ws.onclose = (event) => {
  //       console.log('test is deconnect');
  //       console.log('WebSocket chat disconnected');
  //       console.log(event);
  //     };

  //     ws.onerror = (error) => {
  //       console.error('WebSocket chat error:', error);
  //     };

  //     setSocket(ws);
  //   }
  // };

  // add

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
      const { sender, receiver, message, receiver_id, sender_id } = receivedData;
  
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









// useEffect(() => {
//   return () => {
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       socket.close();  // Clean up WebSocket on unmount
//     }
//   };
// }, [socket]);

// Auto-scroll to the end of messages when new messages arrive
// useEffect(() => {
//   if (endRef.current) {
//     endRef.current.scrollIntoView({ behavior: 'smooth' });
//   }
// }, [messages, selectedUser]);

  // Reference to the end of the message list
// const endRef = useRef(null);





  // first methode
  // useEffect(() => {
  //   fetchFriends();

  //   return () => {
  //     if (socket) {
  //       socket.close(); // Clean up WebSocket on unmount
  //     }
  //   };
  // }, []);






//   11111

// export const ChatContext = createContext({
// 	value: 'true',
// });

// export const ChatProvider = ({ children }) => {

//   // all useState

//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isChatVisible, setIsChatVisible] = useState(false);
//   const [onlineUser, setOnlineUser] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   // const [allUsers, setAllUsers] = useState(usersData);
//   const [allUsers, setAllUsers] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [text, setText] = useState('');
//   const [messages, setMessages] = useState({}); // Messages stored by user ID
//   const [originalUsers, setOriginalUsers] = useState([]); // Store the full list of users

//   // const [users, setUsers] = useState(null)
//   const [users, setUsers] = useState([]);

//   const [socket, setSocket] = useState(null); // WebSocket connection

//   const [userCount, setUserCount] = useState(0);  // Track the number of friends

//   const [messageschat, setMessageschat] = useState({}); // Messages object keyed by user ID


//   const { profileData: currentUser } = useAuth();

//   // // Effect to initialize the online users state with a default set of users
//   // useEffect(() => {
//   //     const activeUsers = usersData.filter(user => user.active).slice(0, 4);

//   //     // Fill the active users list with default users if there are less than 4 active users
//   //     const defaultUser = { name: 'Default User', email: '', active: false, img: '/Profil.svg' };
//   //     while (activeUsers.length < 4) {
//   //         activeUsers.push(defaultUser);
//   //     }

//   //     setOnlineUser(activeUsers);
//   // }, []);

//   // Fetch users data
//   // useEffect(() => {
//   //   const fetchUsers = async () => {
//   //     const responce = await fetch('data/users.json');
//   //     // const response = await fetch(`/users.json?timestamp=${new Date().getTime()}`);
//   //     const users = await responce.json();
//   //     setOriginalUsers(users); // Store the original list of users
//   //     setAllUsers(users);
//   //     console.log("allUsers = ",allUsers)
//   //     const online = users.filter(user => user.active).slice(0, 4);

//   //     // Fill the active users list with default users if there are less than 4 active users
//   //     const defaultUser = { name: 'Default User', email: '', active: false, img: '/Profil.svg' };
//   //     while (online.length < 4) {
//   //       online.push(defaultUser);
//   //     }

//   //     setOnlineUser(online);
//   //   };
//   //   fetchUsers();
//   //   // }, [allUsers])
//   // }, []);


//   const handleSearch = event => {
//     const term = event.target.value.toLowerCase();
//     setSearchTerm(term);

//     if (term === '') {
//       // Reset to full list if search term is cleared
//       setAllUsers(originalUsers);
//     } else {
//       // Filter based on search term
//       const filtered = originalUsers.filter(user => user.username.toLowerCase().includes(term));
//       setAllUsers(filtered);
//     }
//   };

//   const fetchChatHistory = async (receiver_id) => {
//     try {
//       console.log("receiver_id", receiver_id);
//       // Use getData to fetch chat history from the specified endpoint
//       const response = await getData(`/chat-history/${receiver_id}`);
//       console.log("response chat-history -> ", response);
      
//       // Update messages state with the chat history for the specific receiver
//       setMessageschat((prevMessages) => ({
//         ...prevMessages,
//         [receiver_id]: response.data,  // Store chat history under the receiver's ID
//       }));
//     } catch (error) {
//       console.error('Error fetching chat history:', error);
//     }
//   };
  

//   // Function to handle user selection, update the selected user state, and show the chat component on smaller screens
//   const handleUserClick = user => {
//     setSelectedUser(user);
//     setIsChatVisible(true);
//     console.log("hollla the id is = ", user.id);
//     console.log("username is = ", user.username);

//     fetchChatHistory(user.id);  // Fetch chat history for the selected user

//     // Programmatically push new route with the user's ID
//     // router.push(`/chat/${user.id}`);
//     connectWebSocket(user.id)
//   };

//   // Function to handle back button click, hide the chat component on smaller screens
//   const handleBackClick = () => {
//     setIsChatVisible(false);
//   };

//   // Function to handle emoji selection and append the selected emoji to the message text
//   const handleEmojiClick = emoji => {
//     setText(prev => prev + emoji.emoji);
//     // if i want select just one emogi -> setOpen(false)
//     // setOpen(false);
//   };

//   // const handleSendMessage = () => {

//   //   if (selectedUser && text.trim() !== '') {
//   //     const newMessage = {
//   //       text: text.trim(),
//   //     };

//   //     // --------- add -------
//   //     // Create a new empty object to copy the existing messages
//   //     const newMessages = {};

//   //     // Manually copy properties from the original messages object to the new object
//   //     for (let key in messages) {
//   //       if (messages.hasOwnProperty(key)) {
//   //         newMessages[key] = messages[key];
//   //       }
//   //     }

//   //     // Check if the selected user's message array exists, if not, create it
//   //     if (!newMessages[selectedUser.id]) {
//   //       newMessages[selectedUser.id] = [];
//   //     } // --------- add -------

//   //     // Add the new message to the user's message array
//   //     newMessages[selectedUser.id].push(newMessage);

//   //     // Update the state with the modified messages object
//   //     setMessages(newMessages);

//   //     setText(''); // Clear the input field after sending
//   //   }
//   // };


//     //  the new  handleSendMessage
//   const handleSendMessage = () => {
//     if (text.trim() && selectedUser && socket) {
//       const messageData = {
//         sender: currentUser.id,
//         receiver: selectedUser.id,
//         text: text.trim(),
//       };

//       // Send the message via WebSocket
//       socket.send(JSON.stringify(messageData));

//       // Update the local state with the new message
//       setMessages((prevMessages) => {
//         const updatedMessages = { ...prevMessages };
//         if (!updatedMessages[selectedUser.id]) {
//           updatedMessages[selectedUser.id] = [];
//         }
//         updatedMessages[selectedUser.id].push(messageData);
//         return updatedMessages;
//       });

//       // Clear the text input after sending the message
//       setText('');
//     }
//   };


//   // Handle Enter key press
//   const handleKeyPress = event => {
//     if (event.key === 'Enter') {
//       event.preventDefault();
//       handleSendMessage();
//     }
//   };

//   // Reference to the end of the message list
//   const endRef = useRef(null);
//   // Scroll to the end of the messages whenever messages or selectedUser changes
//   useEffect(() => {
//     if (endRef.current) {
//       endRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages, selectedUser]); // Trigger on messages or user change

//   // connectWebSocket

//   const connectWebSocket = (receiver_id) =>{

//     if (socket) {
//       socket.close(); // Close the previous socket if it exists
//     }

//     // const receiver_id = 3;
//     if (receiver_id) {
    
//       const ws = new WebSocket(`ws://localhost:8000/ws/chat/${receiver_id}`);

//       ws.onopen = () => {
//         console.log('WebSocket connected hhh');
//       };

//       ws.onmessage = (event) => {
//         console.log(event)
//         console.log("message is received fr")

//         const receivedData = JSON.parse(event.data);
//         const { sender, receiver, text } = receivedData;

//         setMessages((prevMessages) => {
//           const updatedMessages = { ...prevMessages };
//           const userId = sender === 'currentUserId' ? receiver : sender;

//           if (!updatedMessages[userId]) {
//             updatedMessages[userId] = [];
//           }
//           updatedMessages[userId].push(receivedData);
//           return updatedMessages;
//         });
//       };

//       ws.onclose = (event) => {
//         console.log('WebSocket disconnected fr');
//         console.log(event);
//       };

//       ws.onerror = (error) => {
//         console.error('WebSocket error fr:', error);
//       };

//       setSocket(ws);
//     }
//   }




// // The component can now render users or a loading indicator
//   //  useEffect(() => {

//   //   if (!users)
//   //     fetchFriends();  // Fetch friends list when component mounts
//   //   // if (users)
//   //       console.log('useers : ', users);
//   //   // Clean up the WebSocket connection when the component unmounts
//   //   return () => {
//   //     if (socket) {
//   //       socket.close();
//   //     }
//   //   };
//   // }, [users]);




//   const fetchFriends = async () => {
//     try {
//       const response = await getData("/chat-friends");
//       console.log('response in chat: ', response);
  
//       if (response.status === 200) {
//         const newUsers = response.data.results;
  
//         // Only update if the list of users has changed
//         if (newUsers.length !== users.length) {

//           setOriginalUsers(newUsers); // Store the original list of users
//           setAllUsers(newUsers);
//           // console.log("allUsers = ", allUsers)

//           setUsers(newUsers);  // Update users state
//           // console.log(users)

//           setUserCount(newUsers.length);  // Update the number of friends
//         }
//       } else {
//         console.error("Unexpected response status:", response.status);
//       }
//     } catch (error) {
//       console.error("Failed to fetch friends:", error);
//     }
//   };
  
//   useEffect(() => {
//     console.log("allUsers updated here: ", allUsers);
//   }, [allUsers]);
   
//   // useEffect to fetch friends when the component mounts and when user count changes
//   useEffect(() => {
//     console.log("userCount ->", userCount)
//     fetchFriends();  // Fetch friends when component mounts or userCount changes
  
//     // Clean up the WebSocket connection when component unmounts
//     return () => {
//       if (socket) {
//       socket.close();
//       }
//   };
//   }, []);
//   // }, [userCount]);  // Run effect when userCount changes



//   return (
//     <ChatContext.Provider
//       value={{
//         selectedUser,
//         isChatVisible,
//         handleUserClick,
//         handleBackClick,
//         onlineUser,
//         allUsers,
//         searchTerm,
//         handleSearch,
//         open,
//         setOpen,
//         text,
//         setText,
//         messages,
//         handleSendMessage,
//         handleEmojiClick,
//         handleKeyPress,
//         endRef,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

