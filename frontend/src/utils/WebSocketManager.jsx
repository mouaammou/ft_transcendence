class WebSocketManager {
    constructor(url) {
        if (!WebSocketManager.instance) {
            this.socket = new WebSocket(url);
            WebSocketManager.instance = this;
            this.messageHandlers = [];
            this.isConnected = false;

            this.socket.onopen = () => {
                console.log('WebSocket /global connection opened');
                this.isConnected = true;
            };

            this.socket.onclose = () => {
                console.log('WebSocket /global connection closed');
                this.isConnected = false;
                WebSocketManager.instance = null; // Reset instance on close
            };

            this.socket.onmessage = (event) => {
                this.messageHandlers.forEach(handler => handler(event)); // Call all handlers
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }
        return WebSocketManager.instance;
    }

    sendMessage(message) {
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
            return true;
        } else {
            // console.error('websocket is not initialized');
            return false;
        }
    }

    close() {
        if (this.socket) {
            this.socket.close();
            this.isConnected = false;
        }
    }

    registerMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }

    unregisterMessageHandler(method) {
        this.messageHandlers = this.messageHandlers.filter(handler => handler !== method);
    }
}

const instance = new WebSocketManager('ws://localhost:8000/ws/global/');
export default instance;