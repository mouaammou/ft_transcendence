// add "use client" because of onChange in input;
"use client";


import '@/Styles/chat/list_chat.css'
import React, { useState, useEffect } from 'react';
import Image from "next/image";
// import { BiSolidBellRing } from "react-icons/bi";
import { HiBell } from "react-icons/hi2";
import UserList from '@/components/chat/list/UserList/UserList'


const users = [
    { name: 'User 1', email: 'user2@example.com', active: false , img: '/Profil.svg'},
    { name: 'mouad', email: 'user1@example.com', active: true , img: '/mouad.jpeg'},
    { name: 'Said', email: 'user3@example.com', active: true , img: '/samjaabo.jpeg'},
    { name: 'User 4', email: 'user4@example.com', active: false , img: '/user2.svg'},
    { name: 'khalid', email: 'user5@example.com', active: true , img: '/avatar3.jpeg'},
    { name: 'User 6', email: 'user6@example.com', active: false , img: '/avatar4.jpeg'},
    { name: 'Oussama', email: 'user7@example.com', active: true , img: '/oredoine.webp'},
    { name: 'User 8', email: 'user8@example.com', active: false , img: '/Profil.svg'},
    { name: 'User 9', email: 'user4@example.com', active: false , img: '/user2.svg'},
    { name: 'User 10', email: 'user10@example.com', active: false , img: '/Profil.svg'},
];

const list_chat = () =>{

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
        <div className="list_chat">
            <div className='user-chat'>
                <div className='info-user'>
                    <Image src="/med.jpeg" alt='mohammed' width={65} height={65} style={{borderRadius: '50%', border: '3px solid #F1FAEE'}}/>
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
                    <UserList users={onlineUser} listType="online" />
                </div>
            </div>
            <div>
                <h2> all user</h2>
                <div className="all-user">
                    <UserList  users={allUsers} listType="all" />
                </div>
            </div>
        </div>
    )
}

export default list_chat;