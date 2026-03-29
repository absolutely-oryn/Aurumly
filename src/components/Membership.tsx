import React from 'react';
import { motion } from 'motion/react';
import { Crown, Star, Zap, Shield, Check, ArrowRight } from 'lucide-react';

const Membership = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="text-center mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full">
              Premium Access
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
              AURUM<span className="text-[#D4AF37]">LY</span> ELITE
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Unlock the full potential of your learning journey with our premium membership. Coming soon to all students.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            {
              title: 'Free',
              price: '$0',
              features: ['Standard Quizzes', 'Basic Leaderboard', 'Public Profile', 'Limited Study Materials'],
              button: 'Current Plan',
              active: false,
            },
            {
              title: 'Elite',
              price: '$9.99',
              features: ['Unlimited Quizzes', 'Global Leaderboard', 'Private Profile', 'Premium Study Materials', 'AI Tutor Access', 'Ad-free Experience'],
              button: 'Coming Soon',
              active: true,
            },
            {
              title: 'School',
              price: 'Custom',
              features: ['Bulk Accounts', 'Teacher Dashboard', 'Custom Quizzes', 'Analytics & Reports', 'Priority Support'],
              button: 'Contact Us',
              active: false,
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-10 rounded-3xl border transition-all flex flex-col ${
                plan.active
                  ? 'bg-gradient-to-b from-[#D4AF37]/20 to-white/5 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.1)] scale-105 z-10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.active ? 'text-[#D4AF37]' : 'text-white'}`}>{plan.title}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-500 text-sm">/month</span>}
                </div>
              </div>

              <div className="space-y-4 mb-12 flex-grow">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check size={16} className={plan.active ? 'text-[#D4AF37]' : 'text-gray-600'} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={plan.button === 'Coming Soon'}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  plan.active
                    ? 'bg-[#D4AF37] text-black hover:bg-[#F9E79F]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } disabled:opacity-50`}
              >
                {plan.button}
                {plan.active && <ArrowRight size={18} />}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Crown className="text-[#D4AF37]" />, title: 'Exclusive Content', desc: 'Access premium lessons curated by experts.' },
            { icon: <Zap className="text-blue-400" />, title: 'AI Tutor', desc: 'Get instant help with complex problems using AI.' },
            { icon: <Shield className="text-green-500" />, title: 'Privacy First', desc: 'Your data is encrypted and secure with us.' },
            { icon: <Star className="text-purple-500" />, title: 'Elite Badge', desc: 'Show off your status on the leaderboard.' },
          ].map((feature, i) => (
            <div key={i} className="text-center p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                {feature.icon}
              </div>
              <h4 className="font-bold mb-2">{feature.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Membership;
