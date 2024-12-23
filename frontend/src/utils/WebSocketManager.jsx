import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

const GlobalWebSocket = createContext(null);

export const GlobalWebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    const { sendMessage, lastMessage, readyState, lastJsonMessage } = useWebSocket( "ws://localhost:8000/ws/global/", {
        onOpen: () => {
            console.log('WebSocket connection opened');
            setIsConnected(true);
        },
        // onClose: () => {
        //     console.log('WebSocket connection closed');
        //     setIsConnected(false);
        // },
        // onError: (error) => {
        //     console.log('WebSocket error:', error);
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
        <GlobalWebSocket.Provider value={contextValue}>
            {children}
        </GlobalWebSocket.Provider>
    );
};

export const useGlobalWebSocket = () => {
    return useContext(GlobalWebSocket);
};
