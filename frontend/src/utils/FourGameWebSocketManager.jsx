import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

const ConnectFourWebSocket = createContext(null);

export const ConnectFourWebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);


    const { sendMessage, lastMessage, readyState, lastJsonMessage } = useWebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_API_URL}/ws/four_game/`, {
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
        <ConnectFourWebSocket.Provider value={contextValue}>
            {children}
        </ConnectFourWebSocket.Provider>
    );
};

export const useConnectFourWebSocket = () => {
    return useContext(ConnectFourWebSocket);
};