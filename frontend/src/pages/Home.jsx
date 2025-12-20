import React, { useState, useRef, useEffect } from "react";
import { socketService } from "../services/socket.service";
import "./Home.css";

export const Home = () => {
    const [recording, setRecording] = useState(false);
    const [messages, setMessages] = useState([]);
    const mediaRecorderRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const audioContextRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Listen for transcript updates from backend
    useEffect(() => {
        socketService.onTranscript((text) => {
            setMessages((prev) => [...prev, { text, sender: "bot" }]);
        });
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        let silenceThreshold = 3; // adjust based on your mic
        let lastSent = 0;

        mediaRecorder.ondataavailable = async (e) => {
            analyser.getByteTimeDomainData(dataArray);
            const rms = Math.sqrt(dataArray.reduce((sum, val) => sum + (val - 128) ** 2, 0) / dataArray.length);

            // only send if volume above threshold
            if (rms > silenceThreshold) {
                const arrayBuffer = await e.data.arrayBuffer();
                socketService.emitAudio(arrayBuffer);
                setMessages((prev) => [...prev, { text: "🎤 Sending audio...", sender: "user" }]);
                lastSent = Date.now();
            }
        };

        mediaRecorder.start(300);
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
    };


    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        audioContextRef.current?.close();
        setRecording(false);
    };

    return (
        <div className="chat-container">
            <header className="chat-header">Voice-to-Text Chat</header>

            <main className="chat-messages">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="chat-footer">
                <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`record-btn ${recording ? "stop" : "start"}`}
                >
                    {recording ? "Stop" : "Record"}
                </button>
                <span className="record-status">
                    {recording ? "Recording..." : "Tap to speak"}
                </span>
            </footer>
        </div>
    );
};
