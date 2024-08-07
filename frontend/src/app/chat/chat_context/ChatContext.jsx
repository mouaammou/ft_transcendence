import React, {createContext, useState, useEffect } from 'react';
import usersData from '../data/users.json'


export const ChatContext = createContext();

export const ChatProvider = ( { children } ) => {

    // all useState
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [onlineUser, setOnlineUser] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState(usersData);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');


    // Effect to initialize the online users state with a default set of users
    useEffect(() => {
        const activeUsers = usersData.filter(user => user.active).slice(0, 4);

        // Fill the active users list with default users if there are less than 4 active users
        const defaultUser = { name: 'Default User', email: '', active: false, img: '/Profil.svg' };
        while (activeUsers.length < 4) {
            activeUsers.push(defaultUser);
        }

        setOnlineUser(activeUsers);
    }, []);
    // }, [users]);


    // Function to handle search input and filter the users list based on the search term
    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = usersData.filter(user =>
            user.name.toLowerCase().includes(term)
        );
        setAllUsers(filtered);
    };

    // Function to handle user selection, update the selected user state, and show the chat component on smaller screens
    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsChatVisible(true);
    };

    // Function to handle back button click, hide the chat component on smaller screens
    const handleBackClick = () => {
        setIsChatVisible(false);
    };

    // Function to handle emoji selection and append the selected emoji to the message text
    const handleEmojiClick = (emoji) => {
        setText((prev) => prev + emoji.emoji);
    };

    return (
        <ChatContext.Provider value={{ 
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
                handleEmojiClick
            }}>
            {children}
        </ChatContext.Provider>
    );
}

