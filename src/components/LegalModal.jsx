import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LegalModal({ activeModal, setActiveModal }) {
  return (
    <AnimatePresence>
      {activeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/80 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-brand-900 border border-brand-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-brand-400 hover:text-brand-50 transition-colors"
            >
              ✕
            </button>

            {activeModal === 'privacy' && (
              <div className="space-y-4 text-brand-300 text-sm leading-relaxed">
                <h2 className="text-2xl font-display font-bold text-brand-50 mb-6">Privacy Policy</h2>
                <p>VoyageAI is committed to protecting your privacy. We do not require you to create an account or provide personal identifying information to use our service.</p>
                <h3 className="text-brand-50 font-bold mt-4">Data Collection & Usage</h3>
                <p>The travel preferences you enter (destination, budget, interests) are temporarily processed to generate your itinerary.</p>
                <h3 className="text-brand-50 font-bold mt-4">Third-Party AI Processing</h3>
                <p>To create your custom travel plan, your search parameters are securely transmitted to Google's Gemini AI API. We do not use your data to train our own models.</p>
                <h3 className="text-brand-50 font-bold mt-4">Local Storage</h3>
                <p>Your most recently generated itinerary is saved locally in your own web browser. We do not store this data on our servers. You can clear this data at any time by clicking "Start New Trip."</p>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-4 text-brand-300 text-sm leading-relaxed">
                <h2 className="text-2xl font-display font-bold text-brand-50 mb-6">Terms of Service</h2>
                <p>By accessing VoyageAI, you agree to these terms. Our service is provided for planning and entertainment purposes only.</p>
                <h3 className="text-brand-50 font-bold mt-4">AI-Generated Content Disclaimer</h3>
                <p>VoyageAI utilizes artificial intelligence to generate travel itineraries. While we strive for accuracy, AI can produce outdated, incomplete, or incorrect information. VoyageAI does not guarantee the availability, pricing, safety, or quality of any recommended hotels, restaurants, or activities. You are solely responsible for independently verifying all travel details before your trip.</p>
                <h3 className="text-brand-50 font-bold mt-4">Usage Rules</h3>
                <p>You agree to use VoyageAI for personal travel planning. Automated scraping, reverse engineering, or exploiting the application's API is strictly prohibited.</p>
              </div>
            )}

            {activeModal === 'contact' && (
              <div className="space-y-6 text-brand-300 text-sm leading-relaxed text-center">
                <h2 className="text-3xl font-display font-bold text-brand-50 mb-2">Get in Touch</h2>
                <p className="text-brand-400 mb-8 text-base">Have a question or want to collaborate? Reach out to us at either of the addresses below!</p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center p-5 bg-brand-950/50 border border-brand-800 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-brand-50 font-bold text-lg">Supriyo Suvam</span>
                      <span className="text-brand-500 text-xs mt-1">suvamsupriyo@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-5 bg-brand-950/50 border border-brand-800 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-brand-50 font-bold text-lg">Mitali Swaroop</span>
                      <span className="text-brand-500 text-xs mt-1">mitaliswaroop182@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
