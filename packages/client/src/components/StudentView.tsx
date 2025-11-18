import { useState, useEffect } from 'react';
import { socket } from '../socket';

interface StudentViewProps {
    joinCode: string;
}

export default function StudentView({ joinCode }: StudentViewProps) {
    const [status, setStatus] = useState<'WAITING' | 'ANSWERING' | 'SUBMITTED' | 'DISCUSSING'>('WAITING');
    const [prompt, setPrompt] = useState<string>('');
    const [myResponse, setMyResponse] = useState<string>('');
    const [swappedThought, setSwappedThought] = useState<string>('');

    useEffect(() => {
        // Listen for new prompts from the teacher
        socket.on('NEW_PROMPT', (data: { content: string }) => {
            setPrompt(data.content);
            setStatus('ANSWERING');
            setMyResponse(''); // Reset previous response
        });

        // Listen for the "Swap" event
        socket.on('RECEIVE_SWAP', (data: { content: string }) => {
            setSwappedThought(data.content);
            setStatus('DISCUSSING');
        });

        return () => {
            socket.off('NEW_PROMPT');
            socket.off('RECEIVE_SWAP');
        };
    }, []);

    const submitResponse = () => {
        socket.emit('SUBMIT_THOUGHT', {
            joinCode,
            content: myResponse
        });
        setStatus('SUBMITTED');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Room Code: {joinCode}</h2>

            {status === 'WAITING' && (
                <div className="card">
                    <h3>Waiting for the teacher...</h3>
                    <p>Sit tight! The prompt will appear here shortly.</p>
                </div>
            )}

            {status === 'ANSWERING' && (
                <div className="card">
                    <h3>Prompt:</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{prompt}</p>
                    <textarea
                        value={myResponse}
                        onChange={(e) => setMyResponse(e.target.value)}
                        placeholder="Type your thought here..."
                        rows={4}
                        style={{ width: '100%', padding: '0.5rem', margin: '1rem 0' }}
                    />
                    <button onClick={submitResponse} disabled={!myResponse.trim()}>
                        Submit Thought
                    </button>
                </div>
            )}

            {status === 'SUBMITTED' && (
                <div className="card">
                    <h3>Response Submitted!</h3>
                    <p>Waiting for the thought swap...</p>
                </div>
            )}

            {status === 'DISCUSSING' && (
                <div className="card" style={{ border: '2px solid #646cff' }}>
                    <h3>✨ Time to Discuss ✨</h3>
                    <p>You received this thought from a peer:</p>
                    <blockquote style={{ fontStyle: 'italic', background: '#f9f9f9', padding: '1rem' }}>
                        "{swappedThought}"
                    </blockquote>
                    <p>Discuss this with your group!</p>
                </div>
            )}
        </div>
    );
}