import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Study from './components/Study';
import Membership from './components/Membership';
import AITutor from './components/AITutor';
import StudyGroups from './components/StudyGroups';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37] selection:text-black">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/membership" element={<Membership />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study"
              element={
                <ProtectedRoute>
                  <Study />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-tutor"
              element={
                <ProtectedRoute>
                  <AITutor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <StudyGroups />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Footer */}
          <footer className="bg-black border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-2xl font-bold tracking-tighter">
                AURUM<span className="text-[#D4AF37]">LY</span>
              </div>
              <div className="flex gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Contact Support</a>
              </div>
              <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                © 2026 Aurumly Education. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
