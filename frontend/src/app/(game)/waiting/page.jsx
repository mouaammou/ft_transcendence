// src/components/WaitingPage.jsx
"use client"
import React from 'react'
import mysocket from '@/utils/WebSocketManager'; // Adjust the path as needed
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js router
import { useAuth } from "@/components/auth/loginContext.jsx";
import { getData } from '@/services/apiCalls';
import { useWebSocketContext } from '@/components/websocket/websocketContext';

const WaitingPage = () => {
    const {setOpponent} = useWebSocketContext();
    const [waiting, setWaiting] = useState(true);
    
	const {profileData: user_data} = useAuth();
    const [myuser, setMyuser] = useState(null);
    
    const router = useRouter(); // Use Next.js router


    const Skeleton = () => (
        <div className="animate-pulse bg-gray-600 rounded-full w-16 h-16 ml-2" />
    );

    useEffect(() => {
        // Register message handler for WebSocket messages
        let timer;
        const handleMessage = async (message) => {
            const data = JSON.parse(message.data);

            if (data.status === 'start') {
                const opponent_id = data.opponent;
            
                // Fetch user data based on opponent ID
                console.log("The player id you will play with is ", opponent_id);
                const fetchedUser = await getData(`/friendProfileId/${opponent_id}`);
            
                if (fetchedUser.status === 200) {
                    setMyuser(fetchedUser.data); // Assuming data structure contains user data
            
                    // Ensure fetchedUser.data is valid
                    if (fetchedUser.data) {
                        const sentData = {
                            username: String(fetchedUser.data.username), // Assuming this is a string
                            avatar: String(fetchedUser.data.avatar),     // Assuming this is a string
                            side: String(data.side)                       // This should also be a string or number
                        };
                        
                        setOpponent(sentData);
                        console.log("You can start, this is the player you will play with ------> ", fetchedUser.data);
            
                        timer = setTimeout(() => {
                            router.push('/game'); // This must be a flat object with only strings/numbersrouter.push('/dashboard', { scroll: false })}
                        }, 1000); // 2000 milliseconds = 2 seconds
            
                    } else {
                        console.error('Fetched user data is invalid');
                    }
                } else {
                    console.error('Failed to fetch opponent data');
                }
            }
            else if (data.status === 'already_in_game') {
                router.push('/game');
                console.log("hi blablo,  ")
            }
        };
        mysocket.registerMessageHandler(handleMessage);
        // Notify backend that the player is waiting
        // mysocket.sendMessage(JSON.stringify({ action: 'join_waiting_room' }));
 
        // Cleanup on unmount
        return () => {
            clearTimeout(timer);
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
                {waiting &&
                    <>
                        <img src={user_data?.avatar} alt="" className="w-16 h-16 rounded-full mr-2  bg-gray-700" />
                        <span className="text-2xl font-bold">VS</span>
                        {(myuser &&  <img src={myuser?.avatar} alt="" className="w-16 h-16 rounded-full mx-2 bg-gray-700" /> ) || <Skeleton/>}
                    </>
                }
            </div>
            {waiting && (
                <h2 className="text-center text-gray-600">Waiting for another player to join...</h2>
            )}
        </div>
    </div>
    );
};

export default WaitingPage;