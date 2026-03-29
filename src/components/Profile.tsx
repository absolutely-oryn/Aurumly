import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db, doc, onSnapshot, updateDoc, setDoc, deleteDoc, handleFirestoreError, OperationType, collection, getDocs, query, where } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User, Mail, GraduationCap, Star, Zap, Trophy, Shield, Edit2, Save, X, Check, Ban } from 'lucide-react';
import { UserProfile, Grade } from '../types';
import { GRADES } from '../constants';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDisplayName, setEditedDisplayName] = useState('');
  const [editedGrade, setEditedGrade] = useState<Grade>('Grade 8');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingTeachers, setPendingTeachers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserProfile;
          setProfile(data);
          setEditedDisplayName(data.displayName);
          setEditedGrade(data.grade);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.role === 'admin' || user?.email === 'alemsegedy@gmail.com') {
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'), where('status', '==', 'pending'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const teachers = snapshot.docs.map(doc => doc.data() as UserProfile);
        setPendingTeachers(teachers);
      });
      return () => unsubscribe();
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const oldGrade = profile.grade;
      const newGrade = editedGrade;
      const newName = editedDisplayName;

      // Update User Profile
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: newName,
        grade: newGrade,
      });

      // Update Leaderboard Entry
      if (oldGrade !== newGrade) {
        // Delete old entry
        await deleteDoc(doc(db, 'leaderboards', oldGrade, 'entries', user.uid));
        // Create new entry
        await setDoc(doc(db, 'leaderboards', newGrade, 'entries', user.uid), {
          uid: user.uid,
          displayName: newName,
          score: profile.totalPoints || 0,
          grade: newGrade
        });
      } else if (profile.displayName !== newName) {
        // Update existing entry
        await updateDoc(doc(db, 'leaderboards', oldGrade, 'entries', user.uid), {
          displayName: newName
        });
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user?.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTeacherAction = async (teacherUid: string, action: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', teacherUid), {
        status: action
      });
    } catch (err) {
      console.error('Error updating teacher status:', err);
    }
  };

  const handleSeedData = async () => {
    if (!user || (profile?.role !== 'admin' && user.email !== 'alemsegedy@gmail.com')) return;
    setSaving(true);
    try {
      const quizzes = [
        {
          id: 'math-8-1',
          title: 'Introduction to Algebra',
          description: 'Test your basic algebra skills with this Grade 8 quiz.',
          grade: 'Grade 8',
          createdBy: user.uid,
          createdAt: new Date(),
          questions: [
            {
              id: 'q1',
              text: 'What is the value of x in 2x + 5 = 15?',
              options: ['5', '10', '7.5', '2'],
              correctOption: 0,
              explanation: 'Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5.'
            },
            {
              id: 'q2',
              text: 'Simplify: 3(x + 4) - 2x',
              options: ['x + 12', '5x + 12', 'x + 4', 'x - 12'],
              correctOption: 0,
              explanation: 'Distribute: 3x + 12 - 2x. Combine like terms: x + 12.'
            }
          ]
        },
        {
          id: 'physics-9-1',
          title: 'Newton\'s Laws',
          description: 'Master the laws of motion with this Grade 9 physics quiz.',
          grade: 'Grade 9',
          createdBy: user.uid,
          createdAt: new Date(),
          questions: [
            {
              id: 'q1',
              text: 'Which law states that for every action there is an equal and opposite reaction?',
              options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravity'],
              correctOption: 2,
              explanation: 'Newton\'s Third Law states that forces always occur in pairs.'
            }
          ]
        }
      ];

      for (const quiz of quizzes) {
        await setDoc(doc(db, 'quizzes', quiz.id), quiz);
      }
      alert('Quizzes seeded successfully!');
    } catch (err) {
      console.error('Error seeding data:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl"
        >
          {/* Header Banner */}
          <div className="h-48 bg-gradient-to-r from-[#D4AF37]/40 via-[#D4AF37]/20 to-black relative">
            <div className="absolute -bottom-16 left-10 w-32 h-32 bg-black border-4 border-[#D4AF37] rounded-full flex items-center justify-center overflow-hidden shadow-2xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={64} className="text-[#D4AF37]" />
              )}
            </div>
            <div className="absolute bottom-4 right-10 flex gap-4">
              {(profile?.role === 'admin' || user?.email === 'alemsegedy@gmail.com') && (
                <button
                  onClick={handleSeedData}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg"
                >
                  Seed Data
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-lg"
              >
                {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="pt-20 px-10 pb-12">
            <div className="mb-10">
              {isEditing ? (
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input
                      type="text"
                      value={editedDisplayName}
                      onChange={(e) => setEditedDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Grade Level</label>
                    <select
                      value={editedGrade}
                      onChange={(e) => setEditedGrade(e.target.value as Grade)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#D4AF37] outline-none transition-all appearance-none"
                    >
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade} className="bg-black text-white">{grade}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#F9E79F] transition-all disabled:opacity-50 shadow-lg"
                  >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">{profile?.displayName}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <Mail size={14} className="text-[#D4AF37]" /> {profile?.email}
                    </span>
                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <GraduationCap size={14} className="text-[#D4AF37]" /> {profile?.grade}
                    </span>
                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <Shield size={14} className="text-[#D4AF37]" /> {profile?.role || 'Student'}
                    </span>
                    {profile?.role === 'teacher' && (
                      <span className={`flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border ${
                        profile.status === 'approved' ? 'border-green-500/50 text-green-400' : 
                        profile.status === 'pending' ? 'border-yellow-500/50 text-yellow-400' : 
                        'border-red-500/50 text-red-400'
                      }`}>
                        Status: {profile.status}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {[
                { label: 'Total Points', value: profile?.totalPoints || 0, icon: <Star size={24} className="text-[#D4AF37]" /> },
                { label: 'Quizzes Done', value: profile?.completedQuizzes.length || 0, icon: <Zap size={24} className="text-blue-400" /> },
                { label: 'Global Rank', value: '#12', icon: <Trophy size={24} className="text-purple-400" /> },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center group hover:border-[#D4AF37]/30 transition-all">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:bg-[#D4AF37]/10 transition-all">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Admin Panel: Teacher Approval */}
            {(profile?.role === 'admin' || user?.email === 'alemsegedy@gmail.com') && pendingTeachers.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="text-[#D4AF37]" /> Pending Teacher Approvals
                </h3>
                <div className="space-y-4">
                  {pendingTeachers.map((teacher) => (
                    <div key={teacher.uid} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">{teacher.displayName}</div>
                        <div className="text-sm text-gray-400">{teacher.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTeacherAction(teacher.uid, 'approved')}
                          className="p-2 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500/30 transition-all"
                          title="Approve"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => handleTeacherAction(teacher.uid, 'rejected')}
                          className="p-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 transition-all"
                          title="Reject"
                        >
                          <Ban size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
