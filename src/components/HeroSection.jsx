import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection({ onStart }) {
  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center py-20"
    >
      <span className="inline-flex items-center mb-6 border border-brand-800 text-brand-400 py-1 px-4 rounded-full bg-brand-900/50 text-sm font-medium">
        <Sparkles className="w-4 h-4 mr-2 text-brand-300" />
        AI-Powered Travel Planning
      </span>
      <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
        Your Perfect Trip,<br />
        <span className="text-brand-400">Planned by AI.</span>
      </h1>
      <p className="text-brand-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
        Stop spending hours researching. Get a personalized, day-by-day itinerary based on your interests, budget, and travel style in seconds.
      </p>
      <button
        className="inline-flex items-center justify-center font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 h-14 px-8 text-lg rounded-full transition-colors"
        onClick={onStart}
      >
        Start Planning <ArrowRight className="ml-2 w-5 h-5" />
      </button>
    </motion.div>
  );
}
