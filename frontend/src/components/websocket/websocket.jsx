import Cookies from "js-cookie"
import { useEffect, useState } from "react"

function getCookie(){
    const access_token = Cookies.get("access_token")
    return access_token
}

const useWebSocket = (url) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // const token = getCookie(); // Retrieve the access_token
        // const wsUrl = `${url}?token=${token}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, [url]);

    return {isConnected, messages}
}

export default useWebSocket