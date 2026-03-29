import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut, User, Trophy, BookOpen, LayoutDashboard, HelpCircle, BrainCircuit, Users, Plus } from 'lucide-react';
import { auth, signOut, db, doc, onSnapshot } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserProfile } from '../types';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
      });
      return () => unsubscribe();
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: <BookOpen size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, protected: true },
    { name: 'AI Tutor', path: '/ai-tutor', icon: <BrainCircuit size={18} />, protected: true },
    { name: 'Groups', path: '/groups', icon: <Users size={18} />, protected: true },
    { 
      name: 'Build Quiz', 
      path: '/create-quiz', 
      icon: <Plus size={18} />, 
      protected: true, 
      role: ['teacher', 'admin'],
      requireApproval: true
    },
    { name: 'Quiz', path: '/quiz', icon: <HelpCircle size={18} />, protected: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={18} />, protected: true },
    { name: 'Profile', path: '/profile', icon: <User size={18} />, protected: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.protected && !user) return false;
    if (link.role && profile) {
      if (!link.role.includes(profile.role)) return false;
      if (link.requireApproval && profile.role === 'teacher' && profile.status !== 'approved') return false;
    } else if (link.role && !profile) {
      return false;
    }
    return true;
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md py-3 shadow-lg border-b border-[#D4AF37]/20' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold tracking-tighter text-white group-hover:text-[#D4AF37] transition-colors">
              AURUM<span className="text-[#D4AF37]">LY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#D4AF37] ${
                  location.pathname === link.path ? 'text-[#D4AF37]' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => signOut(auth)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-full hover:bg-[#F9E79F] transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[#D4AF37] transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-[#D4AF37]/20 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-4 rounded-md text-base font-medium transition-colors ${
                    location.pathname === link.path ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    signOut(auth);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-4 text-left text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-3 py-4 text-center bg-[#D4AF37] text-black font-bold rounded-md"
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
