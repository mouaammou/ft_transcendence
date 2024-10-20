import React, { createContext, useState, useEffect, useRef } from 'react';
// import usersData from '../data/users.json'

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  // all useState

  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [onlineUser, setOnlineUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [allUsers, setAllUsers] = useState(usersData);
  const [allUsers, setAllUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState({}); // Messages stored by user ID
  const [originalUsers, setOriginalUsers] = useState([]); // Store the full list of users

  // // Effect to initialize the online users state with a default set of users
  // useEffect(() => {
  //     const activeUsers = usersData.filter(user => user.active).slice(0, 4);

  //     // Fill the active users list with default users if there are less than 4 active users
  //     const defaultUser = { name: 'Default User', email: '', active: false, img: '/Profil.svg' };
  //     while (activeUsers.length < 4) {
  //         activeUsers.push(defaultUser);
  //     }

  //     setOnlineUser(activeUsers);
  // }, []);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      const responce = await fetch('data/users.json');
      // const response = await fetch(`/users.json?timestamp=${new Date().getTime()}`);
      const users = await responce.json();
      setOriginalUsers(users); // Store the original list of users
      setAllUsers(users);

      const online = users.filter(user => user.active).slice(0, 4);

      // Fill the active users list with default users if there are less than 4 active users
      const defaultUser = { name: 'Default User', email: '', active: false, img: '/Profil.svg' };
      while (online.length < 4) {
        online.push(defaultUser);
      }

      setOnlineUser(online);
    };
    fetchUsers();
    // }, [allUsers])
  }, []);

  // Function to handle search input and filter the users list based on the search term
  // const handleSearch = (event) => {
  //     const term = event.target.value.toLowerCase();
  //     setSearchTerm(term);

  //     const filtered = usersData.filter(user =>
  //         user.name.toLowerCase().includes(term)
  //     );
  //     setAllUsers(filtered);
  // };

  // Handle user search
  // const handleSearch = (event) => {
  //     const term = event.target.value.toLowerCase();
  //     setSearchTerm(term);
  //     const filtered = allUsers.filter(user =>
  //         user.name.toLowerCase().includes(term)
  //     );
  //     setAllUsers(filtered);
  // };

  const handleSearch = event => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      // Reset to full list if search term is cleared
      setAllUsers(originalUsers);
    } else {
      // Filter based on search term
      const filtered = originalUsers.filter(user => user.name.toLowerCase().includes(term));
      setAllUsers(filtered);
    }
  };

  // Function to handle user selection, update the selected user state, and show the chat component on smaller screens
  const handleUserClick = user => {
    setSelectedUser(user);
    setIsChatVisible(true);
  };

  // Function to handle back button click, hide the chat component on smaller screens
  const handleBackClick = () => {
    setIsChatVisible(false);
  };

  // Function to handle emoji selection and append the selected emoji to the message text
  const handleEmojiClick = emoji => {
    setText(prev => prev + emoji.emoji);
    // if i want select just one emogi -> setOpen(false)
    // setOpen(false);
  };

  const handleSendMessage = () => {
    // if (text.trim() !== '')
    // {
    //     const newMessage = {
    //         user: selectedUser,
    //         text: text,
    //     }
    //     setMessages((PrevMessages) =>{
    //         PrevMessages.push(newMessage);
    //         return PrevMessages; // Return the updated array
    //     });

    //     setText(''); // Clear the input field
    // }

    if (selectedUser && text.trim() !== '') {
      const newMessage = {
        text: text.trim(),
      };
      // console.log("this the text = ",text);

      // // Create a new messages object
      // const newMessages = Object.assign({}, messages);

      // // Initialize the user's message array if it doesn't exist
      // if (!newMessages[selectedUser.id]) {
      //     newMessages[selectedUser.id] = [];
      // }

      // --------- add -------
      // Create a new empty object to copy the existing messages
      const newMessages = {};

      // Manually copy properties from the original messages object to the new object
      for (let key in messages) {
        if (messages.hasOwnProperty(key)) {
          newMessages[key] = messages[key];
        }
      }

      // Check if the selected user's message array exists, if not, create it
      if (!newMessages[selectedUser.id]) {
        newMessages[selectedUser.id] = [];
      } // --------- add -------

      // Add the new message to the user's message array
      newMessages[selectedUser.id].push(newMessage);

      // console.log("this the newMessage = ",newMessage);
      // console.log("this the messages = ",newMessages);

      // Update the state with the modified messages object
      setMessages(newMessages);

      setText(''); // Clear the input field after sending
    }
  };

  // Handle Enter key press
  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Reference to the end of the message list
  const endRef = useRef(null);
  // Scroll to the end of the messages whenever messages or selectedUser changes
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUser]); // Trigger on messages or user change

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
