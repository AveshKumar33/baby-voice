import { io } from "socket.io-client";

class SocketService {
    constructor() {
        // Connect to NestJS Gateway
        this.socket = io("http://localhost:4000", {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });
    }

    // Emit audio chunks to backend
    emitAudio(chunk) {
        if (this.socket.connected) {
            this.socket.emit("audio", chunk);
        } else {
            console.warn("Socket not connected yet");
        }
    }

    // Listen for transcript updates
    onTranscript(callback) {
        if (typeof callback === "function") {
            this.socket.off("transcript"); // remove previous listeners
            this.socket.on("transcript", callback);
        }
    }
}

export const socketService = new SocketService();
