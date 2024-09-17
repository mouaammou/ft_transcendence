class WebSocketManager {
    constructor(url) {
        if (!WebSocketManager.instance) {
            
            this.socket = new WebSocket(url);
            WebSocketManager.instance = this;
            this.messageHandlers = [];
    
            this.socket.onopen = () => {
                console.log('WebSocket connection opened');
            }
    
            this.socket.onclose = () => {
                console.log('WebSocket connection closed');
            }

            this.socket.onmessage = (event) => {
                // console.log('message from the server -->  ', event.data);
                this.messageHandlers.forEach(handler => handler(event));// call all handlers

            };
        }    
        return WebSocketManager.instance;
    }


    sendMessage(message) {
        if (this.socket) {
            this.socket.send(message);
            console.log('websocket send message');
        } else {
            console.error('websocket is not initialized');
        }
    }

    close() {
        if (this.socket)
        {
            console.log('websocket closed');
            this.socket.close();
        }
    }

    registerMessageHandler(handler) {
        console.log('the message handler is registred');
        this.messageHandlers.push(handler);
    }

    unregisterMessageHandler(method) {
        console.log('the handler deleted');
        this.messageHandlers = this.messageHandlers.filter(handler => handler !== method)
    }

}

const instance = new WebSocketManager('ws://localhost:8000/ws/global/')
export default instance;