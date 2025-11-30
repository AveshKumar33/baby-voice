import React, { useEffect, useState } from "react";
import { socketService } from "../services/socket.service";

export const TranscriptDisplay = () => {
    const [transcripts, setTranscripts] = useState([]);

    useEffect(() => {
        socketService.onTranscript((text) => {
            setTranscripts((prev) => [...prev, text]);
        });
    }, []);

    return (
        <div className="p-4 border rounded h-64 overflow-y-auto bg-gray-50">
            {transcripts.map((t, i) => (
                <p key={i}>{t}</p>
            ))}
        </div>
    );
};
