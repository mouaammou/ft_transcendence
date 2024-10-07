// src/components/WaitingFriendPage.jsx
"use client"
import React from 'react'
import mysocket from '@/utils/WebSocketManager'; // Adjust the path as needed
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js router
import { useAuth } from "@/components/auth/loginContext.jsx";
import { getData } from '@/services/apiCalls';
import { useWebSocketContext } from '@/components/websocket/websocketContext';
import '@/styles/game/waitingFriendPage.css';

const WaitingFriendPage = () => {

    const { profileData: user_data } = useAuth();
    const [myfriend, setMyfriend] = useState(null);

    const router = useRouter(); // Use Next.js router
    const { websocket, invitationResponse, setInvitationResponse, setOpponent } = useWebSocketContext();


    useEffect(() => {
        // Register message handler for WebSocket messages
        let timer;
        const handleMessage = async (message) => {
            const data = JSON.parse(message.data);

            if (data.status === 'start') {
                // Redirect to the game page
                router.push('/game');
            }
        };
        mysocket.registerMessageHandler(handleMessage);


        let asdf = localStorage.getItem('selectedFriend');
        console.log('my selected friend is  : ', asdf);
        if (asdf) {
            asdf = JSON.parse(asdf);
            setMyfriend(asdf);
        } else {
            // router.push('/friends');
        }
        return () => {
            mysocket.unregisterMessageHandler(handleMessage);
        };
    }, []);

    useEffect(() => {
        console.log('333333333333333######     invitationResponse', invitationResponse);
        if (invitationResponse) {
            if (invitationResponse === 'acceptGame') {
                console.log('invitation accepted');
                setOpponent(myfriend);
                localStorage.setItem('opponent', JSON.stringify(myfriend));
                setInvitationResponse(null);
                mysocket.sendMessage(JSON.stringify({ 
                    type: 'FRIEND_GAME_REQUEST',
                    player_1_id: user_data.id,
                    player_2_id: myfriend.id,
                 }));
                router.push('/game');
            } else if (invitationResponse === 'rejectGame') {
                console.log('invitation rejected');
                router.push('/list_of_friends');
                setInvitationResponse(null);
            }
        }
    }, [invitationResponse]);


    // const sent = mysocket.sendMessage(JSON.stringify());
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-gray-500 rounded-lg max-w-md w-full p-6">
                <h1 className="text-2xl text-center font-balsamiq mb-12">Waiting for {myfriend?.username} to join</h1>
                <div className="flex items-center justify-center mb-4">
                    <img src={user_data?.avatar} alt="" className="w-[80] h-[80] rounded-full  bg-gray-700" />
                    <span className="text-2xl font-balsamiq mx-14 ">VS</span>
                    <div className="relative loader">
                        <img src={myfriend?.avatar} alt="" className="w-[80] h-[80] rounded-full  bg-gray-700" />
                    </div>
                </div>
            </div>
        </div>
    );
    // the second image pulsing effect is not working
    /* HTML: <div class="loader"></div> */
};



export default WaitingFriendPage;