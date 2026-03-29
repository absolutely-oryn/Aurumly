import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2, BookOpen, BrainCircuit } from 'lucide-react';
import { auth, db, doc, getDoc } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserProfile } from '../types';

const AITutor = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((doc) => {
        if (doc.exists()) setProfile(doc.data() as UserProfile);
      });
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `You are Aurumly AI, a premium educational tutor for Grade 8-12 students. 
            The student is in ${profile?.grade || 'Grade 8'}. 
            Current Points: ${profile?.totalPoints || 0}.
            Quizzes Completed: ${profile?.completedQuizzes.length || 0}.
            
            Answer their questions about subjects, explain topics simply, and provide study recommendations. 
            Keep the tone professional, encouraging, and premium.
            
            Student Question: ${userMessage}` }]
          }
        ],
      });

      const response = await model;
      const text = response.text;
      setMessages(prev => [...prev, { role: 'model', text: text || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to my brain right now. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#9A7D0A] rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">AURUM<span className="text-[#D4AF37]">LY</span> AI TUTOR</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Powered by Gemini 3.0</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
            <Sparkles size={12} /> Personalized for {profile?.grade}
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto mb-6 space-y-6 pr-4 scrollbar-thin scrollbar-thumb-[#D4AF37]/20"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Bot size={40} className="text-[#D4AF37]" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-xl font-bold mb-2">How can I help you today?</h3>
                <p className="text-sm">Ask me about any subject, request an explanation for a complex topic, or get study tips.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                {[
                  "Explain photosynthesis simply",
                  "Study tips for Grade 10 Math",
                  "What is quantum entanglement?",
                  "How to improve my quiz scores?"
                ].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs hover:border-[#D4AF37]/50 transition-all text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-[#D4AF37]'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#D4AF37] text-black font-medium' 
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-[#D4AF37] flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Aurumly AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="w-full pl-6 pr-16 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#D4AF37] text-black rounded-xl flex items-center justify-center hover:bg-[#F9E79F] transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
