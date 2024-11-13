class WebSocketManager {
  constructor(url) {
    if (!WebSocketManager.instance) {
      this.socket = new WebSocket(url);
      WebSocketManager.instance = this;
      this.messageHandlers = [];
      this.isConnected = false;
      this.socket.onopen = () => {
        // console.log('WebSocket connection opened');
        this.isConnected = true;
      };

      this.socket.onclose = () => {
        // console.log('WebSocket connection closed');
        this.isConnected = false;
      };

      this.socket.onmessage = event => {
        // console.log('message from the server -->  ', event.data);
        this.messageHandlers.forEach(handler => handler(event)); // call all handlers
      };
    }
    return WebSocketManager.instance;
  }

  // reconnect = false;

  sendMessage(message) {
    if (this.isConnected) {
      this.socket.send(message);
      // console.log("send a request to start remote random game");
      return true;
    } else {
      console.log('websocket is not initialized');
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
    // console.log('the message handler is registred');
    this.messageHandlers.push(handler);
  }

  unregisterMessageHandler(method) {
    // console.log('the handler deleted');
    this.messageHandlers = this.messageHandlers.filter(handler => handler !== method);
  }
}

const instance = new WebSocketManager('ws://localhost:8000/ws/global/');
export default instance;
