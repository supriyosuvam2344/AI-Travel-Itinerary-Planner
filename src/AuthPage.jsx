import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Plane } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  // State to toggle between "Sign Up" (false) and "Log In" (true)
  const [isLogin, setIsLogin] = useState(false); 

  const handleSubmit = (e) => {
    e.preventDefault();
    // Later, you will add your database save logic here!
    
    // For now, it just redirects the user back to the home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-950 text-brand-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background blur effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-400/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Logo to go back home */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 font-display font-bold text-xl hover:opacity-80 transition-opacity"
      >
        <div className="bg-brand-50 text-brand-950 p-1.5 rounded-lg">
          <Plane className="w-5 h-5" />
        </div>
        VoyageAI
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-brand-900/50 border border-brand-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-brand-50 mb-2">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-brand-400 text-sm">
              {isLogin ? 'Enter your details to access your trips.' : 'Start planning your perfect itinerary today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username - Shows on both Log In and Sign Up */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-200">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-brand-500 pointer-events-none" />
                <input 
                  type="text" 
                  required
                  placeholder="Username" 
                  className="w-full bg-brand-950/50 border border-brand-800 rounded-lg h-11 pl-10 pr-4 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Email - ONLY shows on Sign Up */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-200">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-brand-500 pointer-events-none" />
                      <input 
                        type="email" 
                        required={!isLogin}
                        placeholder="xyz@example.com" 
                        className="w-full bg-brand-950/50 border border-brand-800 rounded-lg h-11 pl-10 pr-4 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password - Shows on both */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-brand-500 pointer-events-none" />
                <input 
                  type="password" /* <--- THIS MAKES IT SHOW AS DOTS */
                  required
                  placeholder="Password" 
                  className="w-full bg-brand-950/50 border border-brand-800 rounded-lg h-11 pl-10 pr-4 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* Confirm Password - ONLY shows on Sign Up */}
                  <div className="space-y-1.5 mt-4">
                    <label className="text-sm font-medium text-brand-200">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-brand-500 pointer-events-none" />
                      <input 
                        type="password" /* <--- DOTS AGAIN */
                        required={!isLogin}
                        placeholder="Re-enter Password" 
                        className="w-full bg-brand-950/50 border border-brand-800 rounded-lg h-11 pl-10 pr-4 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Action Button */}
            <button 
              type="submit"
              className="w-full h-12 mt-6 flex items-center justify-center font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-xl transition-colors"
            >
              {isLogin ? 'Log In' : 'Sign Up'} <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>

          {/* The Toggle Link at the bottom */}
          <div className="mt-8 text-center text-sm text-brand-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-50 font-bold hover:underline underline-offset-4"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}