"use client";
import { useEffect, useState, useRef, createContext, useContext } from 'react';

export const WebSocketContext = createContext("");

export const WebSocketProvider = ({url, children}) => {

	const [isConnected, setIsConnected] = useState(false);
	const websocket = useRef(null);

	useEffect(() => {
		// Create WebSocket instance when the component mounts
		if ( ! isConnected) {
			websocket.current = new WebSocket(url);

			websocket.current.onopen = () => {
			console.log('WebSocket connected');
				setIsConnected(true);
			};

			websocket.current.onclose = () => {
				console.log('WebSocket disconnected');
				setIsConnected(false);
			};

			websocket.current.onerror = (error) => {
				console.error('WebSocket error:', error);
			};
		}

		return () => {
			if (websocket.current) {
				websocket.current.close();
			}
		};
	}, []);

	return (
		<WebSocketContext.Provider value={{isConnected, websocket, setIsConnected}}>
			{children}
		</WebSocketContext.Provider>
	)
};

export const useWebSocketContext = () => useContext(WebSocketContext);



