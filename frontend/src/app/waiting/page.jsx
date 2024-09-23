// src/components/WaitingPage.jsx
"use client"
import React from 'react'
import mysocket from '@/utils/WebSocketManager'; // Adjust the path as needed
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js router
import { useAuth } from "@/components/auth/loginContext.jsx";

const WaitingPage = () => {
    const [waiting, setWaiting] = useState(true);
    const router = useRouter(); // Use Next.js router
	const {profileData: user_data} = useAuth()
    const Skeleton = () => (
        <div className="animate-pulse bg-gray-100 rounded-full w-16 h-16 ml-2" />
    );

    useEffect(() => {
        // Register message handler for WebSocket messages
        const handleMessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.status === 'start') {
                setWaiting(false);
               
                    router.push('/game'); // Adjust the game route as needed
  
            }
            else if (data.status === 'already_in_game')
                router.push('/game');
        };
        mysocket.registerMessageHandler(handleMessage);
        // Notify backend that the player is waiting
        // mysocket.sendMessage(JSON.stringify({ action: 'join_waiting_room' }));
 
        // Cleanup on unmount
        return () => {
            mysocket.unregisterMessageHandler(handleMessage);
        };
    }, []);

    const sent = mysocket.sendMessage(JSON.stringify(
        {
            "remote":
            {
                mode:'random'
            }
        }
    ));
    console.log("Here is sent ---> ",sent)
    // if (!sent) {
    //     //alert the user that he must reconnect to the backend
    //     router.replace('/play');
    // }
    
    return (
        <div className="flex items-center justify-center min-h-screen  p-4">
        <div className="bg-gray-400 rounded-lg  max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
                {waiting ? (
                    <>
                        <img src={user_data?.avatar} alt="" className="w-16 h-16 rounded-full mr-2  bg-gray-700" />
                        <span className="text-2xl font-bold">VS</span>
                        <Skeleton/>
                        {/* <img src="" alt="" className="w-16 h-16 rounded-full ml-2 bg-gray-900" /> */}
                    </>
                ) : (
                    <h2 className="text-lg text-center">Redirecting to the game...</h2>
                )}
            </div>
            {waiting && (
                <h2 className="text-center text-gray-600">Waiting for another player to join...</h2>
            )}
        </div>
    </div>
    );
};

export default WaitingPage;