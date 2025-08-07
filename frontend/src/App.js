import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import LearningSession from './pages/LearningSession';
import InstantStart from './pages/InstantStart';
import RoadmapDetails from './pages/RoadmapDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/start" element={<InstantStart />} />
            <Route path="/learn/:sessionId?" element={
              <ProtectedRoute allowAnonymous={true}>
                <LearningSession />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowAnonymous={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/roadmap/:roadmapId" element={
              <ProtectedRoute allowAnonymous={true}>
                <RoadmapDetails />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/start" replace />} />
            <Route path="*" element={<Navigate to="/start" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
