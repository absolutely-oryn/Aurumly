import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, doc, onSnapshot } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Plus, Trash2, Save, ArrowRight, BookOpen, HelpCircle, CheckCircle2, X, ShieldAlert } from 'lucide-react';
import { Question, UserProfile } from '../types';
import { Link } from 'react-router-dom';

const CreateQuiz = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState('Grade 8');
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...(newQuestions[qIndex].options || [])];
    newOptions[oIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!user || !profile || !title.trim() || questions.some(q => !q.text?.trim())) return;
    
    if (profile.role !== 'admin' && (profile.role !== 'teacher' || profile.status !== 'approved')) {
      alert('Only approved teachers or admins can publish quizzes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const quizData = {
        title,
        description,
        grade,
        questions: questions.map((q, i) => ({
          ...q,
          id: `q${i + 1}`
        })),
        createdBy: user.uid,
        creatorName: user.displayName || 'Teacher',
        createdAt: serverTimestamp(),
        totalQuestions: questions.length,
        points: questions.length * 10
      };

      const path = 'quizzes';
      try {
        await addDoc(collection(db, 'quizzes'), quizData);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setTitle('');
          setDescription('');
          setQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
        }, 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } catch (err) {
      console.error('Error creating quiz:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profile && profile.role !== 'admin' && (profile.role !== 'teacher' || profile.status !== 'approved')) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl text-center"
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-8">
            Only approved teachers or administrators can create quizzes. 
            {profile.role === 'teacher' && profile.status === 'pending' && ' Your teacher account is currently pending approval.'}
          </p>
          <Link
            to="/dashboard"
            className="block w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              CREATE <span className="text-[#D4AF37]">QUIZ</span>
            </h1>
            <p className="text-gray-500 text-sm">Design your own challenge for the community.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-2xl hover:bg-[#F9E79F] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Quiz'} <Save size={20} />
          </button>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500"
            >
              <CheckCircle2 size={20} />
              <span className="font-bold text-sm uppercase tracking-widest">Quiz published successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {/* Quiz Info Section */}
          <section className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <BookOpen size={14} className="text-[#D4AF37]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Algebra Mastery"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">Grade Level</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm appearance-none"
                >
                  {['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                    <option key={g} value={g} className="bg-black">{g}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will students learn from this quiz?"
                  rows={3}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>
          </section>

          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <HelpCircle size={14} className="text-[#D4AF37]" /> Questions ({questions.length})
              </h3>
              <button
                onClick={addQuestion}
                className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
              >
                <Plus size={14} /> Add Question
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl relative group"
              >
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-6 right-6 p-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">Question {qIndex + 1}</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                      placeholder="Enter your question here..."
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options?.map((option, oIndex) => (
                      <div key={oIndex} className="relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className={`w-full pl-6 pr-12 py-4 bg-white/5 border rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm ${
                            question.correctAnswer === oIndex ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10'
                          }`}
                        />
                        <button
                          onClick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            question.correctAnswer === oIndex 
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                              : 'border-white/20 text-transparent'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">Explanation (Optional)</label>
                    <input
                      type="text"
                      value={question.explanation}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      placeholder="Explain why the correct answer is right..."
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-8 border-2 border-dashed border-white/10 rounded-[40px] text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-all">
                <Plus size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Add another question</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
