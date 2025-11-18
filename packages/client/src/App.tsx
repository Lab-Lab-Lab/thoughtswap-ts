import { useState } from 'react';
import { socket } from './socket';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import './App.css';

type ViewState = 'HOME' | 'STUDENT' | 'TEACHER';

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [joinCode, setJoinCode] = useState('');
  const [username, setUsername] = useState('');

  const handleJoin = () => {
    if (!joinCode || !username) return alert('Please enter code and name');

    // Initialize socket connection for student
    socket.auth = { username };
    socket.connect();

    // Emit join event
    socket.emit('JOIN_ROOM', { joinCode });

    setView('STUDENT');
  };

  return (
    <div className="App">
      {view === 'HOME' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '10vh' }}>
          <h1>⚡ ThoughtSwap</h1>

          <div className="card" style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '12px', width: '300px' }}>
            <h3>Student Join</h3>
            <input
              placeholder="Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <input
              placeholder="Room Code (e.g. 123456)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <button onClick={handleJoin} style={{ width: '100%' }}>Join Room</button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={() => setView('TEACHER')}
              style={{ background: 'transparent', color: '#666', border: '1px solid #ccc' }}
            >
              Login as Teacher
            </button>
          </div>
        </div>
      )}

      {view === 'STUDENT' && <StudentView joinCode={joinCode} />}

      {view === 'TEACHER' && <TeacherView />}
    </div>
  );
}

export default App;