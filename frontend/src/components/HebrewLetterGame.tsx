import React, { useState, useEffect } from "react";
import { Transcriber } from "../hooks/useTranscriber";
import { getRandomLetter, checkAnswer, HebrewLetter } from "../utils/HebrewLetters";
import Constants from "../utils/Constants";

interface Props {
    transcriber: Transcriber;
}

enum GameState {
    READY = "READY",
    RECORDING = "RECORDING",
    PROCESSING = "PROCESSING",
    CORRECT = "CORRECT",
    INCORRECT = "INCORRECT"
}

export function HebrewLetterGame(props: Props) {
    const [currentLetter, setCurrentLetter] = useState<HebrewLetter>(getRandomLetter());
    const [gameState, setGameState] = useState<GameState>(GameState.READY);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [feedback, setFeedback] = useState<string>("");

    // Handle transcription completion
    useEffect(() => {
        if (props.transcriber.output && !props.transcriber.isBusy && gameState === GameState.PROCESSING) {
            const transcribedText = props.transcriber.output.text;
            const isCorrect = checkAnswer(currentLetter, transcribedText);

            if (isCorrect) {
                setGameState(GameState.CORRECT);
                setFeedback(`נכון! אמרת "${transcribedText}"`);
            } else {
                setGameState(GameState.INCORRECT);
                setFeedback(`לא נכון. אמרת "${transcribedText}". נסה שוב!`);
            }
        }
    }, [props.transcriber.output, props.transcriber.isBusy, gameState, currentLetter]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                await processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            setAudioChunks(chunks);
            setMediaRecorder(recorder);
            recorder.start();
            setGameState(GameState.RECORDING);
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("לא ניתן להתחיל הקלטה. אנא ודא שיש לך מיקרופון.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setGameState(GameState.PROCESSING);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
            const audioCTX = new AudioContext({
                sampleRate: Constants.SAMPLING_RATE,
            });
            const arrayBuffer = fileReader.result as ArrayBuffer;
            const decoded = await audioCTX.decodeAudioData(arrayBuffer);
            props.transcriber.start(decoded);
        };
        fileReader.readAsArrayBuffer(audioBlob);
    };

    const nextLetter = () => {
        setCurrentLetter(getRandomLetter());
        setGameState(GameState.READY);
        setFeedback("");
        props.transcriber.onInputChange();
    };

    const getButtonText = () => {
        switch (gameState) {
            case GameState.READY:
                return "🎤 התחל להקליט";
            case GameState.RECORDING:
                return "⏹️ עצור הקלטה";
            case GameState.PROCESSING:
                return "⏳ מעבד...";
            case GameState.CORRECT:
            case GameState.INCORRECT:
                return "➡️ אות הבאה";
            default:
                return "🎤 התחל להקליט";
        }
    };

    const handleButtonClick = () => {
        switch (gameState) {
            case GameState.READY:
                startRecording();
                break;
            case GameState.RECORDING:
                stopRecording();
                break;
            case GameState.CORRECT:
            case GameState.INCORRECT:
                nextLetter();
                break;
        }
    };

    const getBackgroundColor = () => {
        switch (gameState) {
            case GameState.CORRECT:
                return "bg-green-100";
            case GameState.INCORRECT:
                return "bg-red-100";
            case GameState.RECORDING:
                return "bg-yellow-50";
            default:
                return "bg-blue-50";
        }
    };

    const getLetterColor = () => {
        switch (gameState) {
            case GameState.CORRECT:
                return "text-green-600";
            case GameState.INCORRECT:
                return "text-red-600";
            default:
                return "text-blue-600";
        }
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 ${getBackgroundColor()}`}>
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8 text-slate-800">
                    🔤 למד את האותיות! 🔤
                </h1>

                {/* Display the letter */}
                <div className="mb-12">
                    <p className="text-2xl mb-4 text-slate-600">אמור את האות:</p>
                    <div className={`text-[200px] font-bold ${getLetterColor()} transition-colors duration-300`}>
                        {currentLetter.letter}
                    </div>
                    <p className="text-3xl text-slate-600 mt-4">
                        {currentLetter.name}
                    </p>
                </div>

                {/* Record button */}
                <button
                    onClick={handleButtonClick}
                    disabled={gameState === GameState.PROCESSING || props.transcriber.isModelLoading}
                    className={`
                        text-white font-bold py-8 px-16 rounded-3xl text-3xl
                        transition-all duration-200 transform hover:scale-105 active:scale-95
                        shadow-2xl
                        ${gameState === GameState.RECORDING
                            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                            : gameState === GameState.CORRECT
                            ? 'bg-green-600 hover:bg-green-700'
                            : gameState === GameState.INCORRECT
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {getButtonText()}
                </button>

                {/* Feedback message */}
                {feedback && (
                    <div className={`
                        mt-8 p-6 rounded-2xl text-2xl font-semibold
                        ${gameState === GameState.CORRECT
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }
                    `}>
                        {feedback}
                    </div>
                )}

                {/* Loading model message */}
                {props.transcriber.isModelLoading && (
                    <div className="mt-8 p-4 bg-yellow-100 rounded-lg text-lg">
                        <p className="text-yellow-800">טוען מודל... (רק פעם ראשונה)</p>
                        {props.transcriber.progressItems.map((item) => (
                            <div key={item.file} className="mt-2">
                                <div className="text-sm text-yellow-700">{item.file}</div>
                                <div className="w-full bg-yellow-200 rounded-full h-2 mt-1">
                                    <div
                                        className="bg-yellow-600 h-2 rounded-full transition-all"
                                        style={{ width: `${item.progress * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
