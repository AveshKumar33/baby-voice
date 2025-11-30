import React, { useRef, useState } from "react";
import { socketService } from "../services/socket.service";

export const AudioRecorder = () => {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        mediaRecorder.ondataavailable = (e) => {
            socketService.emitAudio(e.data);
        };

        mediaRecorder.start(300); // emit chunk every 300ms
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={recording ? stopRecording : startRecording}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                {recording ? "Stop Recording" : "Start Recording"}
            </button>
        </div>
    );
};
