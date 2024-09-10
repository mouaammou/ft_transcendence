import { useEffect, useState } from 'react';

const useWebSocket = url => {
	const [messages, setMessages] = useState([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {

		const ws = new WebSocket(url);

		ws.onopen = () => {
			console.log('WebSocket connected');
			setIsConnected(true);
		};

		ws.onmessage = event => {
			const data = JSON.parse(event.data);
			setMessages(prevMessages => [...prevMessages, data]);
		};

		ws.onclose = () => {
			console.log('WebSocket disconnected');
			setIsConnected(false);
		};

		ws.onerror = error => {
			console.error('WebSocket error:', error);
		};

		return () => {
			ws.close();
		};
	}, [url]);

	return { isConnected, messages };
};

export default useWebSocket;
