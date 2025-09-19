import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { DialerControl } from './components/DialerControl';
import { DispositionModal } from './components/DispositionModal';
import { SessionInfo } from './components/SessionInfo';
import { useDialerStore } from './store/dialerStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useHotkeys } from './hooks/useHotkeys';
import { authService } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [agentEmail, setAgentEmail] = useState('');
  const { connect, disconnect } = useWebSocket();
  const { sessionId } = useDialerStore();
  
  useHotkeys();
  
  useEffect(() => {
    // Check for stored authentication
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('agentEmail');
    
    if (token && email) {
      setIsAuthenticated(true);
      setAgentEmail(email);
    }
  }, []);
  
  useEffect(() => {
    // Connect WebSocket when session starts
    if (sessionId && isAuthenticated) {
      connect();
    }
    
    return () => {
      if (sessionId) {
        disconnect();
      }
    };
  }, [sessionId, isAuthenticated, connect, disconnect]);
  
  const handleLogin = async (email) => {
    try {
      const token = await authService.login(email);
      localStorage.setItem('token', token);
      localStorage.setItem('agentEmail', email);
      setAgentEmail(email);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setAgentEmail('');
    disconnect();
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="card max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Web App Turbo</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleLogin(formData.get('email'));
            }}
          >
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Agent Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="agent@company.com"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Web App Turbo</h1>
              <span className="text-sm text-gray-500">Preview Dialer</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{agentEmail}</span>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DialerControl agentEmail={agentEmail} />
          </div>
          <div>
            <SessionInfo />
          </div>
        </div>
      </main>
      
      <DispositionModal />
    </div>
  );
}

export default App;