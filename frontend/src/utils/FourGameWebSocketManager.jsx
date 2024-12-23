import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

const ConnectFourWebSocket = createContext(null);

export const ConnectFourWebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    console.log("Opening socket four players")
    const { sendMessage, lastMessage, readyState, lastJsonMessage } = useWebSocket("ws://localhost:8000/ws/four_game/", {
        onOpen: () => {
            console.log('WebSocket c4 connection opened');
            setIsConnected(true);
        },
        // onClose: () => {
        //     console.log('WebSocket c4 connection closed');
        //     setIsConnected(false);
        // },
        // onError: (error) => {
        //     console.log('WebSocket error: c4 ', error);
        // },
        shouldReconnect: (closeEvent) => true, // Will attempt to reconnect on all close events
    });



    const contextValue = useMemo(
        () => ({
            isConnected,
            sendMessage,
            lastMessage,
            lastJsonMessage
        }),
        [isConnected, sendMessage, lastMessage, lastJsonMessage]
    );

    return (
        <ConnectFourWebSocket.Provider value={contextValue}>
            {children}
        </ConnectFourWebSocket.Provider>
    );
};

export const useConnectFourWebSocket = () => {
    return useContext(ConnectFourWebSocket);
};