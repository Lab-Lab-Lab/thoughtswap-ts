import { useState, useEffect } from 'react';
import { socket } from './socket';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import { LogOut, Users, Zap } from 'lucide-react';

type UserRole = 'STUDENT' | 'TEACHER' | null;

interface AuthState {
  isLoggedIn: boolean;
  name: string | null;
  email: string | null;
  role: UserRole;
}

function App() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('thoughtswap_auth');
    return saved ? JSON.parse(saved) : {
      isLoggedIn: false,
      name: null,
      email: null,
      role: null,
    };
  });
  const [joinCode, setJoinCode] = useState('');

  // Get the base Canvas Auth URL from the Express server redirect endpoint
  const CANVAS_AUTH_URL = 'http://localhost:8000/accounts/canvas/login/';

  const updateAuth = (newState: AuthState) => {
    setAuthState(newState);
    if (newState.isLoggedIn) {
      localStorage.setItem('thoughtswap_auth', JSON.stringify(newState));
    } else {
      localStorage.removeItem('thoughtswap_auth');
    }
  };

  // --- OAuth Callback Handler ---
  useEffect(() => {
    // Check if the current URL is the successful redirect from the backend
    if (window.location.pathname === '/auth/success') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      const role = params.get('role') as UserRole;
      const email = params.get('email');

      if (name && role && email) {
        updateAuth({
          isLoggedIn: true,
          name: decodeURIComponent(name),
          email: decodeURIComponent(email),
          role: role,
        });
      }

      // Clean up the URL state
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogout = () => {
    // In a real app, you would hit a backend endpoint to clear the session/JWT
    setAuthState({ isLoggedIn: false, name: null, email: null, role: null });
    setJoinCode('');
    socket.disconnect();
  };

  // --- Student Join Logic (for authenticated students) ---
  const handleStudentJoin = (code: string) => {
    setJoinCode(code);
    // NOTE: Actual socket join logic moved to StudentView to handle errors better
  };

  if (!authState.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-8 flex items-center">
          <Zap className="h-10 w-10 mr-3 text-yellow-500" /> ThoughtSwap
        </h1>
        <p className="text-xl text-gray-600 mb-10">Log in with your Canvas credentials to start.</p>

        <a
          href={CANVAS_AUTH_URL}
          className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 flex items-center space-x-2"
        >
          <Users className="h-6 w-6" />
          <span>Login with Canvas</span>
        </a>
      </div>
    );
  }

  // If logged in, show the appropriate view
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center py-4 px-6 bg-white shadow-md rounded-xl mb-8">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-900">ThoughtSwap</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600">
            {authState.name} ({authState.role})
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {authState.role === 'TEACHER' ?
        <TeacherView /> :
        <StudentView
          auth={authState}
          onJoin={handleStudentJoin}
          joinCode={joinCode}
        />
      }
    </div>
  );
}

export default App;