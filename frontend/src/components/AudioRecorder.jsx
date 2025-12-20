import React, { useRef, useState } from "react";
import { socketService } from "../services/socket.service";

export const AudioRecorder = () => {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.fftSize);

        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        mediaRecorder.ondataavailable = async (e) => {
            analyser.getByteTimeDomainData(dataArray);
            // compute approximate volume
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const val = dataArray[i] - 128;
                sum += val * val;
            }
            const rms = Math.sqrt(sum / dataArray.length); // RMS value
            if (rms > 10) { // only emit if loud enough
                const arrayBuffer = await e.data.arrayBuffer();
                socketService.emitAudio(arrayBuffer);
            }
        };

        mediaRecorder.start(300); // check every 300ms
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
    };



    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            setRecording(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={recording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-full font-bold shadow-lg text-white transition-all duration-200
                    ${recording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
            >
                {recording ? "Stop" : "Record"}
            </button>
            <span className="text-gray-700 font-medium">
                {recording ? "Recording..." : "Tap to speak"}
            </span>
        </div>
    );
};
