import React from "react";
import { AudioRecorder } from "../components/AudioRecorder";
import { TranscriptDisplay } from "../components/TranscriptDisplay";

export const Home = () => {
    return (
        <div className="max-w-2xl mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Voice-to-Text App</h1>
            <AudioRecorder />
            <TranscriptDisplay />
        </div>
    );
};
