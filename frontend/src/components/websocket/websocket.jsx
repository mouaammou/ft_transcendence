"use client";
import {useState, useEffect, createContext, useContext } from "react";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);

    useEffect (() => {
        const newWebSocket = new WebSocket("    ");
        newWebSocket.onopen = () => {
            console.log('Global WebSocket connected')
        }
        
        newWebSocket.onclose = () => {
            console.log('Global WebSocked disconnected');
        }
        
        newWebSocket.onerror = (error) => {
            console.log('Global WebSocket error: ', error);
        }
        
        setSocket(newWebSocket);

        return () => {
            newWebSocket.close();
        };
    }, []);
    return (
        <WebSocketContext.provider value={{socket}}>
            {children}
        </WebSocketContext.provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
