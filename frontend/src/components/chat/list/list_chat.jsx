// add "use client" because of onChange in input;
"use client";


import '@/Styles/chat/list_chat.css'
import React, { useState, useEffect } from 'react';
import Image from "next/image";
// import { BiSolidBellRing } from "react-icons/bi";
import { HiBell } from "react-icons/hi2";
import UserList from '@/components/chat/list/UserList/UserList'


const users = [
    { id: 1, name: 'User 1', email: 'user2@example.com', active: false , img: '/Profil.svg'},
    { id: 2,name: 'mouad', email: 'user1@example.com', active: true , img: '/mouad.jpeg'},
    { id: 3,name: 'Said', email: 'user3@example.com', active: true , img: '/samjaabo.jpeg'},
    { id: 4,name: 'User 4', email: 'user4@example.com', active: false , img: '/user2.svg'},
    { id: 5,name: 'khalid', email: 'user5@example.com', active: true , img: '/avatar3.jpeg'},
    { id: 6,name: 'User 6', email: 'user6@example.com', active: false , img: '/avatar4.jpeg'},
    { id: 7,name: 'Oussama', email: 'user7@example.com', active: true , img: '/oredoine.webp'},
    { id: 8,name: 'User 8', email: 'user8@example.com', active: false , img: '/Profil.svg'},
    { id: 9,name: 'User 9', email: 'user4@example.com', active: false , img: '/user2.svg'},
    { id: 10,name: 'User 10', email: 'user10@example.com', active: false , img: '/Profil.svg'},
];

const list_chat = ( {onUserSelect, isChatVisible} ) =>{

    const [onlineUser, setOnlineUser] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState(users);

    useEffect(() => {
        const activeUsers = users.filter(user => user.active).slice(0, 4);

        // If there are less than 4 active users, add default users to complete the list
        const defaultUser = { name: 'Default User', email: '', active: false, img: '/Profil.svg' };
        while (activeUsers.length < 4) {
            activeUsers.push(defaultUser);
        }

        setOnlineUser(activeUsers);
    }, [users]);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(term)
        );
        setAllUsers(filtered);
    };

    return(
        // <div className="list_chat ">
        // <div className={`list_chat ${isChatVisible ? 'hidden' : ''}`}>
        <div className={`list_chat ${isChatVisible ? 'hidden' : ''}`}>
            <div className='user-chat'>
                <div className='info-user'>
                    <Image src="/med.jpeg" alt='mohammed' className='img-info-user'  width={65} height={65} style={{borderRadius: '50%', border: '3px solid #F1FAEE'}}/>
                    <p> mohammed </p>
                </div>
                <div>
                    <HiBell className='HiBell'/>
                </div>
            </div>
            <div className='div-Search'>
                <input 
                    type="text"
                    placeholder='Search users...'
                    onChange={handleSearch}
                />
            </div>
            <div className= "initial-active-users">
                <h2>Online Now</h2>
                <div className="user-grid">
                    <UserList users={onlineUser} listType="online" onUserSelect={onUserSelect} />
                </div>
            </div>
            <div>
                <h2> all user</h2>
                <div className="all-user">
                    <UserList  users={allUsers} listType="all" onUserSelect={onUserSelect} />
                </div>
            </div>
        </div>
    )
}

export default list_chat;