import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithPopup, googleProvider, db, doc, setDoc, getDoc, signOut } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, Chrome, User, GraduationCap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UserProfile, Grade } from '../types';
import { GRADES } from '../constants';
import { useAuthState } from 'react-firebase-hooks/auth';

const Auth = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade>('Grade 8');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loadingAuth) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loadingAuth, navigate]);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    
    try {
      // Direct call to signInWithPopup to minimize chance of blocker
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', loggedUser.uid));

      if (!userDoc.exists()) {
        const isAdmin = loggedUser.email === 'alemsegedy@gmail.com';
        const newProfile: UserProfile = {
          uid: loggedUser.uid,
          displayName: loggedUser.displayName || (role === 'teacher' ? 'Teacher' : 'Student'),
          email: loggedUser.email || '',
          grade: selectedGrade,
          totalPoints: 0,
          completedQuizzes: [],
          streak: 0,
          lastActive: null,
          badges: [],
          role: isAdmin ? 'admin' : role,
          status: isAdmin ? 'approved' : (role === 'teacher' ? 'pending' : 'approved'),
        };
        await setDoc(doc(db, 'users', loggedUser.uid), newProfile);
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setLoading(false);
      
      if (err.code === 'auth/popup-blocked') {
        setError('Your browser blocked the login popup. Please click the button again or enable popups for this site in your browser settings.');
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'An unexpected error occurred during login.');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          
          <div className="w-24 h-24 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <CheckCircle className="text-[#D4AF37]" size={48} />
          </div>
          
          <h2 className="text-4xl font-black tracking-tighter text-white mb-4 uppercase">
            YOU <span className="text-[#D4AF37]">ALREADY LOGIN</span>
          </h2>
          <p className="text-gray-400 mb-10 font-light">
            Welcome back, <span className="text-white font-bold">{user.displayName}</span>. 
            You are already authenticated.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="group relative block w-full py-5 bg-[#D4AF37] text-black font-black rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.2)]"
            >
              <span className="relative z-10 uppercase tracking-widest">Go to Dashboard</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full py-4 text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20 mb-4">
            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">
              {isLogin ? 'Authentication' : 'Registration'}
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">
            {isLogin ? 'WELCOME' : 'JOIN'} <span className="text-[#D4AF37]">AURUMly</span>
          </h2>
          <p className="text-gray-500 text-sm font-light">
            {isLogin ? 'Enter the elite learning circle.' : 'Start your journey to academic excellence.'}
          </p>
        </div>

        {/* Role Toggle Switch - Physical Look */}
        <div className="mb-10">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">
            Identify Your Role
          </label>
          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex relative w-full shadow-inner">
            <motion.div
              className="absolute top-1.5 bottom-1.5 bg-[#D4AF37] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              initial={false}
              animate={{
                left: role === 'student' ? '6px' : '50%',
                right: role === 'student' ? '50%' : '6px',
              }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-4 text-xs font-black z-10 flex items-center justify-center gap-3 transition-colors uppercase tracking-widest ${
                role === 'student' ? 'text-black' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <GraduationCap size={18} />
              Student
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 py-4 text-xs font-black z-10 flex items-center justify-center gap-3 transition-colors uppercase tracking-widest ${
                role === 'teacher' ? 'text-black' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <User size={18} />
              Teacher
            </button>
          </div>
        </div>

        {/* Grade Selection for Students */}
        <AnimatePresence mode="wait">
          {role === 'student' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 ml-2">
                Academic Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-2 py-3 text-[10px] font-black rounded-xl border transition-all uppercase tracking-tighter ${
                      selectedGrade === grade
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {role === 'teacher' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex gap-4 items-start"
          >
            <AlertCircle size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#D4AF37] font-medium leading-relaxed uppercase tracking-tight">
              Teacher accounts require admin verification. 
              Contact <span className="font-black underline">Alemsegdy@gmail.com</span> for faster approval.
            </p>
          </motion.div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-4 px-8 py-5 bg-white text-black font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Chrome size={20} />
            )}
            <span className="uppercase tracking-widest">
              {loading ? 'Authenticating...' : `Continue with Google`}
            </span>
          </button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-bold text-center uppercase tracking-tight flex flex-col items-center justify-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
                {error.includes('blocked') && (
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 text-[#D4AF37] hover:underline"
                  >
                    Try opening in a new tab
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-gray-500 hover:text-[#D4AF37] transition-colors uppercase tracking-[0.2em]"
            >
              {isLogin ? "New to the platform? Create Account" : 'Existing member? Sign In'}
            </button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 text-[9px] text-gray-600 uppercase tracking-[0.3em] font-black">
            <Lock size={10} />
            End-to-End Encrypted Auth
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
