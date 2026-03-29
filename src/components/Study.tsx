import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, ArrowRight, Play, FileText, Download, Star, Clock } from 'lucide-react';

const Study = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  const lessons = [
    { title: 'Algebraic Expressions', subject: 'Mathematics', duration: '45 mins', level: 'Grade 8', rating: 4.8 },
    { title: 'Newton\'s Laws of Motion', subject: 'Physics', duration: '60 mins', level: 'Grade 9', rating: 4.9 },
    { title: 'Chemical Bonding', subject: 'Chemistry', duration: '50 mins', level: 'Grade 10', rating: 4.7 },
    { title: 'Cell Structure', subject: 'Biology', duration: '40 mins', level: 'Grade 8', rating: 4.6 },
    { title: 'Shakespearean Plays', subject: 'English', duration: '55 mins', level: 'Grade 11', rating: 4.9 },
    { title: 'Calculus: Derivatives', subject: 'Mathematics', duration: '75 mins', level: 'Grade 12', rating: 5.0 },
  ];

  const filteredLessons = lessons.filter(lesson =>
    (selectedSubject === 'All' || lesson.subject === selectedSubject) &&
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 uppercase">
              MASTER YOUR <span className="text-[#D4AF37]">SUBJECTS</span>
            </h1>
            <p className="text-gray-400 font-light">Explore premium lessons curated for your grade level.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm focus:border-[#D4AF37] outline-none transition-all"
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-6 py-2 text-xs font-bold rounded-full border transition-all uppercase tracking-widest ${
                selectedSubject === subject
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLessons.map((lesson, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                  <BookOpen size={24} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {lesson.subject}
                  </span>
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{lesson.level}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 group-hover:text-[#D4AF37] transition-colors">{lesson.title}</h3>

              <div className="flex items-center gap-6 mb-8 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration}</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-[#D4AF37]" /> {lesson.rating}</span>
              </div>

              <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex gap-2">
                  <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <FileText size={18} />
                  </button>
                  <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Download size={18} />
                  </button>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-full hover:bg-[#F9E79F] transition-all">
                  Start Lesson <Play size={14} fill="currentColor" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Search size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Lessons Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Study;
