import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

const GlobalWebSocket = createContext(null);

export const GlobalWebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    const { sendMessage, lastMessage, readyState, lastJsonMessage } = useWebSocket( `${process.env.NEXT_PUBLIC_WEBSOCKET_API_URL}/ws/global/`, {
        onOpen: () => {

            setIsConnected(true);
        },
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
