import { io } from "socket.io-client";

class SocketService {
    constructor() {
        /** Connect to NestJS Gateway on port 4000 */
        this.socket = io("http://localhost:4000", {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        /** Connection events */
        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket.id);
            this.emitHealthCheck();
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });
    }

    /** Emit audio chunks to backend */
    emitAudio(chunk) {
        if (this.socket.connected) {
            /** convert ArrayBuffer to Uint8Array */
            const uint8Array = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : chunk;
            this.socket.emit("audio", uint8Array);
        } else {
            console.warn("Socket not connected yet");
        }
    }


    /** Listen for transcript updates */
    onTranscript(callback) {
        if (typeof callback === "function") {
            this.socket.off("transcript"); // Remove previous listeners
            this.socket.on("transcript", callback);
        }
    }

    /** Emit health check message to backend */
    emitHealthCheck() {
        if (this.socket.connected) {
            this.socket.emit("healthCheck", { message: "Avesh Frontend connected" });
        }
    }
}

export const socketService = new SocketService();
