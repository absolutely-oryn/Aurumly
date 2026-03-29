import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db, doc, getDoc, onSnapshot, updateDoc, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Trophy, BookOpen, HelpCircle, User, ArrowRight, Star, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as UserProfile;
          setProfile(data);

          // Streak and Badge Logic
          const now = new Date();
          const lastActive = data.lastActive ? new Date(data.lastActive.seconds * 1000) : null;
          
          if (!lastActive || now.toDateString() !== lastActive.toDateString()) {
            const updates: any = { lastActive: serverTimestamp() };
            
            // Check for streak
            if (lastActive) {
              const diffTime = Math.abs(now.getTime() - lastActive.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                updates.streak = (data.streak || 0) + 1;
              } else if (diffDays > 1) {
                updates.streak = 1;
              }
            } else {
              updates.streak = 1;
            }

            // Badge Logic
            const newBadges = [...(data.badges || [])];
            if (updates.streak >= 7 && !newBadges.includes('7 Day Streak')) newBadges.push('7 Day Streak');
            if (data.totalPoints >= 100 && !newBadges.includes('Century Scorer')) newBadges.push('Century Scorer');
            if (data.completedQuizzes.length >= 5 && !newBadges.includes('Quiz Master')) newBadges.push('Quiz Master');
            
            if (newBadges.length !== (data.badges?.length || 0)) {
              updates.badges = newBadges;
            }

            const path = `users/${user.uid}`;
            try {
              await updateDoc(doc(db, 'users', user.uid), updates);
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, path);
            }
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
            WELCOME BACK, <span className="text-[#D4AF37] uppercase">{profile?.displayName.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 font-light">
            You are currently studying for <span className="text-white font-semibold">{profile?.grade}</span>. Ready to score better today?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Points', value: profile?.totalPoints || 0, icon: <Star className="text-[#D4AF37]" />, color: 'bg-[#D4AF37]/10' },
            { label: 'Quizzes Completed', value: profile?.completedQuizzes.length || 0, icon: <Zap className="text-blue-400" />, color: 'bg-blue-400/10' },
            { label: 'Daily Streak', value: `${profile?.streak || 0} Days`, icon: <Clock className="text-orange-400" />, color: 'bg-orange-400/10' },
            { label: 'Badges Earned', value: profile?.badges?.length || 0, icon: <Trophy className="text-purple-400" />, color: 'bg-purple-400/10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badges Section */}
        {profile?.badges && profile.badges.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 uppercase tracking-tighter">
              <Trophy size={20} className="text-[#D4AF37]" />
              YOUR <span className="text-[#D4AF37]">ACHIEVEMENTS</span>
            </h3>
            <div className="flex flex-wrap gap-4">
              {profile.badges.map((badge, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="px-6 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                >
                  <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center text-black">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white">{badge}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Study Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-black">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl font-bold">Study Lessons</h2>
              </div>
              <Link to="/study" className="text-[#D4AF37] hover:underline flex items-center gap-2 text-sm font-semibold">
                Explore All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {['Mathematics', 'Physics', 'Chemistry'].map((subject, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    <span className="font-medium">{subject}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quiz Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                  <HelpCircle size={24} />
                </div>
                <h2 className="text-2xl font-bold">Quick Quizzes</h2>
              </div>
              <Link to="/quiz" className="text-blue-400 hover:underline flex items-center gap-2 text-sm font-semibold">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {['Daily Challenge', 'Weekly Mock Test', 'Practice Mode'].map((quiz, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-400/30 transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-medium">{quiz}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Clock size={20} className="text-[#D4AF37]" />
            Recent Activity
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4 font-semibold">Activity</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">Math Quiz #12</td>
                  <td className="px-6 py-4 text-gray-400">Mar 28, 2026</td>
                  <td className="px-6 py-4 font-bold text-[#D4AF37]">85/100</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-[10px] font-bold uppercase">Completed</span></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">Physics Lesson: Mechanics</td>
                  <td className="px-6 py-4 text-gray-400">Mar 27, 2026</td>
                  <td className="px-6 py-4 font-bold text-gray-500">-</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-[10px] font-bold uppercase">In Progress</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
