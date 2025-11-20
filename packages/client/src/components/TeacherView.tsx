import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Users, Send, Shuffle, Power, Copy, CheckCircle, Play, RefreshCw } from 'lucide-react';

interface AuthData {
    name: string | null;
    email: string | null;
    role: string | null;
}

interface TeacherViewProps {
    auth: AuthData;
}

interface Participant {
    socketId: string;
    name: string;
    hasSubmitted: boolean;
}

export default function TeacherView({ auth }: TeacherViewProps) {
    const [isActive, setIsActive] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [promptInput, setPromptInput] = useState('');
    const [promptSent, setPromptSent] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [swapComplete, setSwapComplete] = useState(false);

    useEffect(() => {
        // 1. CRITICAL FIX: Configure Socket Auth before connecting
        socket.auth = {
            name: auth.name,
            role: auth.role,
            email: auth.email
        };

        // 2. Connect if not already connected
        if (!socket.connected) {
            socket.connect();
        }

        // --- EVENT LISTENERS ---
        socket.on('CLASS_STARTED', (data: { joinCode: string }) => {
            console.log("Class started:", data); // Debug log
            setIsActive(true);
            setJoinCode(data.joinCode);
        });

        socket.on('PARTICIPANTS_UPDATE', (data: { participants: Participant[], submissionCount: number }) => {
            setParticipants(data.participants);
            setSubmissionCount(data.submissionCount);
        });

        socket.on('SWAP_COMPLETED', () => {
            setSwapComplete(true);
            alert("Swap successful! Students are now discussing.");
        });

        socket.on('ERROR', (data) => {
            console.error("Socket Error:", data);
            alert(`Error: ${data.message}`);
        });

        return () => {
            socket.off('CLASS_STARTED');
            socket.off('PARTICIPANTS_UPDATE');
            socket.off('SWAP_COMPLETED');
            socket.off('ERROR');
        };
    }, [auth]); // Re-run if auth changes (unlikely during session)

    const startClass = () => {
        console.log("Emitting TEACHER_START_CLASS...");
        socket.emit('TEACHER_START_CLASS');
    };

    const sendPrompt = () => {
        if (!promptInput.trim()) return;
        socket.emit('TEACHER_SEND_PROMPT', { joinCode, content: promptInput });
        setPromptSent(true);
        setSwapComplete(false);
    };

    const triggerSwap = () => {
        socket.emit('TRIGGER_SWAP', { joinCode });
    };

    const endSession = () => {
        if (confirm("Are you sure you want to end the session? All students will be disconnected.")) {
            socket.emit('END_SESSION', { joinCode });
            setIsActive(false);
            setJoinCode('');
            setParticipants([]);
            setPromptSent(false);
            setPromptInput('');
            setSwapComplete(false);
            setSubmissionCount(0);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(joinCode);
    };

    // --- IDLE STATE ---
    if (!isActive) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full border border-gray-100">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Play className="w-8 h-8 text-indigo-600 ml-1" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Start a New Class</h2>
                    <p className="text-gray-600 mb-8">Create a temporary room for your students to join. This will generate a unique 6-character code.</p>
                    <button
                        onClick={startClass}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg shadow-lg transition transform hover:scale-105"
                    >
                        Launch Session
                    </button>
                </div>
            </div>
        );
    }

    // --- ACTIVE DASHBOARD ---
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="bg-green-100 p-3 rounded-lg">
                        <Users className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                        <h2 className="text-xs text-gray-500 font-bold uppercase tracking-wide">Room Code</h2>
                        <div className="flex items-center space-x-2 cursor-pointer group" onClick={copyCode}>
                            <span className="text-4xl font-mono font-bold text-gray-900">{joinCode}</span>
                            <Copy className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="text-right px-6 border-r border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-bold">Students</p>
                        <p className="text-3xl font-bold text-gray-900">{participants.length}</p>
                    </div>
                    <div className="text-right pr-4">
                        <p className="text-xs text-gray-500 uppercase font-bold">Submitted</p>
                        <p className="text-3xl font-bold text-indigo-600">{submissionCount}</p>
                    </div>
                    <button
                        onClick={endSession}
                        className="ml-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center text-sm font-bold"
                    >
                        <Power className="w-4 h-4 mr-2" /> End Class
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`p-6 rounded-xl shadow-lg border-t-4 transition-all ${promptSent ? 'bg-gray-50 border-gray-300' : 'bg-white border-indigo-500'
                        }`}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Send className={`w-5 h-5 mr-2 ${promptSent ? 'text-gray-400' : 'text-indigo-500'}`} />
                            Step 1: Send Prompt
                        </h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={promptInput}
                                onChange={(e) => setPromptInput(e.target.value)}
                                placeholder="e.g., What is the most important theme in Hamlet?"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:bg-gray-100"
                                disabled={promptSent}
                            />
                            <button
                                onClick={sendPrompt}
                                disabled={promptSent || !promptInput}
                                className={`px-6 py-3 font-bold rounded-lg transition flex items-center ${promptSent
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                                    }`}
                            >
                                {promptSent ? 'Sent' : 'Broadcast'}
                            </button>
                        </div>
                        {promptSent && (
                            <div className="mt-4 flex justify-between items-center text-sm">
                                <p className="text-green-600 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" /> Prompt is live on student devices.
                                </p>
                                <button
                                    onClick={() => { setPromptSent(false); setPromptInput(''); setSubmissionCount(0); setSwapComplete(false); }}
                                    className="text-indigo-600 hover:underline flex items-center"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" /> New Prompt
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`p-6 rounded-xl shadow-lg border-t-4 transition duration-300 ${submissionCount > 0 && !swapComplete
                            ? 'bg-white border-green-500 opacity-100'
                            : 'bg-gray-50 border-gray-300 opacity-80'
                        }`}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Shuffle className="w-5 h-5 mr-2 text-green-600" />
                            Step 2: The Swap
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Once enough students have submitted their thoughts, initiate the swap.
                        </p>
                        <button
                            onClick={triggerSwap}
                            disabled={submissionCount < 2 || swapComplete}
                            className={`w-full py-4 text-white font-bold rounded-xl text-lg shadow-md transition flex items-center justify-center
                                ${submissionCount >= 2 && !swapComplete
                                    ? 'bg-green-600 hover:bg-green-700 transform hover:scale-[1.02]'
                                    : 'bg-gray-300 cursor-not-allowed'
                                }
                            `}
                        >
                            <Shuffle className="w-6 h-6 mr-2" />
                            {swapComplete ? 'Swap Completed' : `Swap Thoughts (${submissionCount})`}
                        </button>
                        {submissionCount < 2 && !swapComplete && (
                            <p className="text-center text-sm text-gray-400 mt-3">Waiting for at least 2 submissions...</p>
                        )}
                    </div>
                </div>

                {/* Roster */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px] border border-gray-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-bold text-gray-700 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-gray-500" />
                            Class Roster
                        </h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-4 space-y-2">
                        {participants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                                <Users className="w-8 h-8 mb-2 opacity-20" />
                                <p>Waiting for students...</p>
                            </div>
                        ) : (
                            participants.map((p) => (
                                <div key={p.socketId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-700">{p.name}</span>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Online
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}