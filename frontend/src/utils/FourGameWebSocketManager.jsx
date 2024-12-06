import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

const ConnectFourWebSocket = createContext(null);

export const ConnectFourWebSocketProvider = ({ url, children }) => {
    const [isConnected, setIsConnected] = useState(false);

    const { sendMessage, lastMessage, readyState } = useWebSocket(url, {
        onOpen: () => {
            console.log('WebSocket connection opened');
            setIsConnected(true);
        },
        onClose: () => {
            console.log('WebSocket connection closed');
            setIsConnected(false);
        },
        onError: (error) => {
            console.log('WebSocket error:', error);
        },
        shouldReconnect: () => true, // Will attempt to reconnect on all close events
    });



    const contextValue = useMemo(
        () => ({
            isConnected,
            sendMessage,
            lastMessage,
            readyState,
        }),
        [isConnected, sendMessage, lastMessage]
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