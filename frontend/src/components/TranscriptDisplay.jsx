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
        <div className="h-64 p-4 border rounded-lg bg-white overflow-y-auto">
            {transcripts.length === 0 ? (
                <p className="text-gray-400 text-center">No transcripts yet</p>
            ) : (
                transcripts.map((t, i) => (
                    <p key={i} className="mb-1">
                        {t}
                    </p>
                ))
            )}
        </div>
    );
};
