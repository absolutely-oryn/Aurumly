import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Loader2, X, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const Hero = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleWatchDemo = async () => {
    try {
      setError(null);
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      setIsGenerating(true);
      setShowVideoModal(true);
      setGenerationStep('Initializing AI model...');

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      setGenerationStep('Generating your personalized study demo video...');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A 3D animated video of a cute robot student with headphones, holding an "A+" paper, sitting at a desk with books and a lamp. The robot looks at the paper with glowing blue eyes, then looks up at the camera and waves happily. The background has warm golden bokeh lights, matching the "Study Smart. Score Better" theme.',
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      let attempts = 0;
      while (!operation.done) {
        attempts++;
        if (attempts > 60) throw new Error('Generation timed out. Please try again.');
        
        setGenerationStep(`Bringing the robot to life... (${attempts * 5}s)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      setGenerationStep('Finalizing video...');
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!downloadLink) throw new Error('Failed to retrieve video link.');

      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': process.env.API_KEY || '',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          await window.aistudio.openSelectKey();
          throw new Error('API key session expired. Please select your key again.');
        }
        throw new Error('Failed to download video.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setIsGenerating(false);
    } catch (err: any) {
      console.error('Video generation error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setIsGenerating(false);
    }
  };

  const handleCloseModal = () => {
    setShowVideoModal(false);
    setVideoUrl(null);
    setError(null);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
      {/* Video Background Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          src="https://cdn.pixabay.com/video/2023/10/22/186103-877409241_large.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full">
            The Future of Learning
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
            STUDY <span className="text-[#D4AF37]">SMART.</span><br />
            SCORE <span className="text-[#D4AF37]">BETTER.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 font-light leading-relaxed">
            Aurumly is a premium educational platform designed for Grade 8-12 students. Master your subjects, create custom quizzes, and climb the leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="group relative px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <button 
              onClick={handleWatchDemo}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-[#D4AF37] rounded-full text-black">
                <Play size={14} fill="currentColor" />
              </span>
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Video Modal */}
        <AnimatePresence>
          {showVideoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            >
              <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <button 
                  onClick={handleCloseModal}
                  className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  <X size={24} />
                </button>

                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="relative mb-8">
                      <Loader2 size={64} className="text-[#D4AF37] animate-spin" />
                      <div className="absolute inset-0 blur-2xl bg-[#D4AF37]/20 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">AI is crafting your demo...</h2>
                    <p className="text-gray-400 max-w-md animate-pulse">{generationStep}</p>
                    <div className="mt-12 flex gap-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[#D4AF37]/40 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                      <X className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Generation Failed</h2>
                    <p className="text-gray-400 mb-8 max-w-md">{error}</p>
                    <button 
                      onClick={handleWatchDemo}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-semibold transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                ) : videoUrl ? (
                  <div className="absolute inset-0 flex flex-col">
                    <video 
                      src={videoUrl} 
                      autoPlay 
                      controls 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2 }}
                      >
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-10 py-4 bg-[#D4AF37] text-black font-bold rounded-full shadow-2xl shadow-[#D4AF37]/20 hover:scale-105 transition-all"
                        >
                          Continue to Login <ArrowRight size={20} />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { label: 'Active Students', value: '10K+' },
            { label: 'Quizzes Created', value: '50K+' },
            { label: 'Study Materials', value: '1K+' },
            { label: 'Average Score', value: '92%' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold text-[#D4AF37] mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#D4AF37]/20 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};

export default Hero;
