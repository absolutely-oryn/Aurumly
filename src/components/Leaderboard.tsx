import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, collection, getDocs, query, orderBy, limit, onSnapshot } from '../firebase';
import { Trophy, Star, Zap, User, Medal, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LeaderboardEntry, Grade } from '../types';
import { GRADES } from '../constants';

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade>('Grade 8');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'leaderboards', selectedGrade, 'entries'),
      orderBy('score', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
      setEntries(fetchedEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedGrade]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
              THE <span className="text-[#D4AF37]">ELITE</span> LIST
            </h1>
            <p className="text-gray-400 font-light">Compete with the best students in your grade and earn your place at the top.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition-all uppercase tracking-widest ${
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

        {/* Top 3 Podium */}
        {!loading && entries.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end max-w-5xl mx-auto relative px-4">
            {/* Decorative background glow */}
            <div className="absolute inset-0 bg-[#D4AF37]/5 blur-[120px] rounded-full -z-10" />

            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="order-2 md:order-1 flex flex-col items-center group"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-slate-400/10 rounded-[32px] flex items-center justify-center border-2 border-slate-400/30 group-hover:border-slate-400 transition-all duration-500 rotate-12 group-hover:rotate-0">
                  <Medal size={40} className="text-slate-400 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-400 text-black rounded-2xl flex items-center justify-center font-black text-lg shadow-lg rotate-12">2</div>
              </div>
              <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[40px] w-full h-48 flex flex-col justify-center backdrop-blur-xl group-hover:bg-white/10 transition-all duration-500">
                <div className="font-black text-xl mb-2 truncate text-slate-300 uppercase tracking-tighter">{entries[1].displayName}</div>
                <div className="text-slate-400 font-black text-3xl mb-1">{entries[1].score}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">POINTS</div>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="order-1 md:order-2 flex flex-col items-center group z-10"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#D4AF37]/20 blur-2xl rounded-full animate-pulse" />
                <div className="w-32 h-32 bg-[#D4AF37]/10 rounded-[40px] flex items-center justify-center border-4 border-[#D4AF37] relative group-hover:scale-110 transition-transform duration-500">
                  <Trophy size={56} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#D4AF37] text-black rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-bounce">1</div>
              </div>
              <div className="text-center p-10 bg-gradient-to-b from-[#D4AF37]/20 to-white/5 border-2 border-[#D4AF37]/40 rounded-[50px] w-full h-64 flex flex-col justify-center shadow-[0_0_50px_rgba(212,175,55,0.15)] backdrop-blur-2xl group-hover:border-[#D4AF37] transition-all duration-500">
                <div className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.5em] mb-4">GRAND MASTER</div>
                <div className="font-black text-3xl mb-2 truncate uppercase tracking-tighter">{entries[0].displayName}</div>
                <div className="text-[#D4AF37] font-black text-5xl mb-2 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{entries[0].score}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">POINTS</div>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
              className="order-3 flex flex-col items-center group"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-amber-800/10 rounded-[28px] flex items-center justify-center border-2 border-amber-800/30 group-hover:border-amber-800 transition-all duration-500 -rotate-12 group-hover:rotate-0">
                  <Medal size={36} className="text-amber-800 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                <div className="absolute -top-3 -right-3 w-9 h-9 bg-amber-800 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg -rotate-12">3</div>
              </div>
              <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[40px] w-full h-44 flex flex-col justify-center backdrop-blur-xl group-hover:bg-white/10 transition-all duration-500">
                <div className="font-black text-lg mb-2 truncate text-amber-700 uppercase tracking-tighter">{entries[2].displayName}</div>
                <div className="text-amber-800 font-black text-2xl mb-1">{entries[2].score}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">POINTS</div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Full List */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <Trophy size={48} className="mx-auto mb-4 opacity-20" />
              <p>No entries found for this grade yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                  <th className="px-8 py-6 font-semibold">Rank</th>
                  <th className="px-8 py-6 font-semibold">Student</th>
                  <th className="px-8 py-6 font-semibold">Score</th>
                  <th className="px-8 py-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {entries.map((entry, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs ${
                        i === 0 ? 'bg-[#D4AF37] text-black' :
                        i === 1 ? 'bg-gray-400 text-black' :
                        i === 2 ? 'bg-orange-900 text-white' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-[#D4AF37]/30 transition-colors">
                          <User size={18} className="text-gray-500" />
                        </div>
                        <span className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{entry.displayName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-[#D4AF37]" />
                        <span className="font-black text-white">{entry.score}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        {i < 3 ? (
                          <span className="text-green-500 flex items-center gap-1"><ArrowUp size={14} /> Rising</span>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-1"><Minus size={14} /> Stable</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
