import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

const GlobalWebSocket = createContext(null);

export const GlobalWebSocketProvider = ({ url, children }) => {
    const [messageHandlers, setMessageHandlers] = useState([]);
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
        shouldReconnect: (closeEvent) => true, // Will attempt to reconnect on all close events
    });

    useEffect(() => {
        if (lastMessage !== null) {
            messageHandlers.forEach(handler => handler(lastMessage));
        }
    }, [lastMessage, messageHandlers]);

    const registerMessageHandler = (handler) => {
        setMessageHandlers(prevHandlers => [...prevHandlers, handler]);
    };

    const unregisterMessageHandler = (handler) => {
        setMessageHandlers(prevHandlers => prevHandlers.filter(h => h !== handler));
    };

    const contextValue = useMemo(
        () => ({
            isConnected,
            sendMessage,
            registerMessageHandler,
            unregisterMessageHandler,
            lastMessage,
        }),
        [isConnected, sendMessage, lastMessage, messageHandlers]
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