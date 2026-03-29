import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, collection, getDocs, query, where, doc, updateDoc, increment, arrayUnion, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, Trophy, Clock, Zap, Star } from 'lucide-react';
import { Quiz as QuizType, Question } from '../types';

const Quiz = () => {
  const [user] = useAuthState(auth);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'));
        const querySnapshot = await getDocs(q);
        const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizType));
        setQuizzes(fetchedQuizzes);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quiz: QuizType) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === currentQuiz?.questions[currentQuestionIndex].correctOption) {
      setScore(prev => prev + 10);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    if (!user || !currentQuiz) return;
    setSubmitting(true);
    try {
      // Update user stats
      const userRef = doc(db, 'users', user.uid);
      const userPath = `users/${user.uid}`;
      try {
        await updateDoc(userRef, {
          totalPoints: increment(score),
          completedQuizzes: arrayUnion(currentQuiz.id)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }

      // Update leaderboard entry
      const leaderboardPath = `leaderboards/${currentQuiz.grade}/entries/${user.uid}`;
      const leaderboardRef = doc(db, 'leaderboards', currentQuiz.grade, 'entries', user.uid);
      try {
        await setDoc(leaderboardRef, {
          uid: user.uid,
          displayName: user.displayName || 'Student',
          score: increment(score),
          grade: currentQuiz.grade
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, leaderboardPath);
      }

      setShowResult(true);
    } catch (err: any) {
      console.error('Error finishing quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentQuiz && !showResult) {
    const question = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-[#D4AF37]"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8">{question.text}</h2>

          <div className="space-y-4 mb-8">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(i)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  selectedOption === i
                    ? i === question.correctOption
                      ? 'bg-green-500/10 border-green-500 text-green-500'
                      : 'bg-red-500/10 border-red-500 text-red-500'
                    : selectedOption !== null && i === question.correctOption
                    ? 'bg-green-500/10 border-green-500 text-green-500'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <span className="font-medium">{option}</span>
                {selectedOption !== null && i === question.correctOption && <CheckCircle size={20} />}
                {selectedOption === i && i !== question.correctOption && <XCircle size={20} />}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-[#D4AF37] uppercase text-[10px] tracking-widest block mb-1">Explanation</span>
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
            className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-2xl hover:bg-[#F9E79F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl text-center"
        >
          <div className="w-24 h-24 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={48} className="text-[#D4AF37]" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-gray-400 mb-8">Excellent effort! You've earned points for your hard work.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-bold text-[#D4AF37]">{score}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Points Earned</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-bold text-blue-400">100%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Accuracy</div>
            </div>
          </div>

          <button
            onClick={() => setCurrentQuiz(null)}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Back to Quizzes
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">CHALLENGE <span className="text-[#D4AF37]">YOURSELF</span></h1>
            <p className="text-gray-400 font-light">Select a quiz to test your knowledge and earn points.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
              Level: Intermediate
            </div>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <HelpCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Quizzes Available</h3>
            <p className="text-gray-500">Check back later for new challenges.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                    <Zap size={24} />
                  </div>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {quiz.grade}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#D4AF37] transition-colors">{quiz.title}</h3>
                <p className="text-sm text-gray-500 mb-8 flex-grow">{quiz.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><HelpCircle size={14} /> {quiz.questions.length} Qs</span>
                    <span className="flex items-center gap-1"><Star size={14} /> {quiz.questions.length * 10} Pts</span>
                  </div>
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="px-6 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-full hover:bg-[#F9E79F] transition-all"
                  >
                    Start Quiz
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
