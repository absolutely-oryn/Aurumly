import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, signInWithPopup, googleProvider, db, doc, setDoc, getDoc } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, Chrome } from 'lucide-react';
import { UserProfile, Grade } from '../types';
import { GRADES } from '../constants';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade>('Grade 8');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Create new user profile
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Student',
          email: user.email || '',
          grade: selectedGrade,
          totalPoints: 0,
          completedQuizzes: [],
          streak: 0,
          lastActive: null,
          badges: [],
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join Aurumly'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Login to continue your learning journey' : 'Create an account to start studying smart'}
          </p>
        </div>

        {!isLogin && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Select Your Grade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    selectedGrade === grade
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Chrome size={20} />
            {loading ? 'Processing...' : `Continue with Google`}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500">Premium Education</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center">
              {error}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            Securely powered by Firebase Auth
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
