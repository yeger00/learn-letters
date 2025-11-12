import { useState, useEffect } from "react";
import { Transcriber } from "../hooks/useTranscriber";
import { getRandomLetter, checkAnswer, HebrewLetter } from "../utils/HebrewLetters";
import Constants from "../utils/Constants";
import loadingGif from "../assets/loading.gif";

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
    const [feedback, setFeedback] = useState<string>("");
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

    // Timer effect - tracks transcription time
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (isTimerRunning) {
            intervalId = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isTimerRunning]);

    // Handle transcription completion
    useEffect(() => {
        if (props.transcriber.output && !props.transcriber.isBusy && gameState === GameState.PROCESSING) {
            const transcribedText = props.transcriber.output.text;
            const isCorrect = checkAnswer(currentLetter, transcribedText);

            setIsTimerRunning(false);

            if (isCorrect) {
                setGameState(GameState.CORRECT);
                setFeedback(`נכון!`);
            } else {
                setGameState(GameState.INCORRECT);
                setFeedback(`לא נכון. אמרת "${transcribedText}"`);
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
            setElapsedTime(0);
            setIsTimerRunning(true);
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
        setElapsedTime(0);
        setIsTimerRunning(false);
        props.transcriber.onInputChange();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getButtonText = () => {
        switch (gameState) {
            case GameState.READY:
                return "🎤 התחל להקליט";
            case GameState.RECORDING:
                return "⏹️ עצור הקלטה";
            case GameState.PROCESSING:
                return "⏳ מעבד";
            case GameState.CORRECT:
            case GameState.INCORRECT:
                return "אות הבאה";
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
        <div className={`fixed inset-0 w-screen h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 ${getBackgroundColor()}`}>
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8 text-slate-800">
                    למד את האותיות
                </h1>

                {/* Display the letter */}
                <div className="mb-12">
                    <p className="text-2xl mb-4 text-slate-600">אמור את האות:</p>
                    <div className={`text-[200px] font-bold ${getLetterColor()} transition-colors duration-300`}>
                        {currentLetter.letter}
                    </div>
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

                {/* Processing/Loading state */}
                {gameState === GameState.PROCESSING && (
                    <div className="mt-8 flex flex-col items-center">
                        <img src={loadingGif} alt="Loading..." className="w-32 h-32" />
                        <div className="mt-4 text-xl text-slate-700">
                            הזמן שחלף: <span className="font-bold">{formatTime(elapsedTime)}</span>
                        </div>
                    </div>
                )}

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
                        <p className="text-yellow-800 font-bold mb-2">טוען מודל... (רק פעם ראשונה)</p>
                        <p className="text-yellow-700 text-base">זה עשוי לקחת עד 2 דקות</p>
                    </div>
                )}
            </div>
        </div>
    );
}
