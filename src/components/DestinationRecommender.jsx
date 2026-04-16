import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Sparkles, MapPin, Loader2, Compass } from 'lucide-react';
import VibeChecker from './VibeChecker';

export default function DestinationRecommender() {
  const [preferences, setPreferences] = useState({
    nature: 3,
    history: 3,
    nightlife: 3,
    relaxation: 3,
    adventure: 3
  });
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // ⚠️ UPDATE THIS URL TO YOUR RENDER URL
      const response = await fetch("https://voyage-ml-api.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the ML engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4 mb-12">
        <span className="inline-flex items-center border border-brand-800 text-brand-400 py-1 px-4 rounded-full bg-brand-900/50 text-sm font-medium">
          <Compass className="w-4 h-4 mr-2 text-brand-300" />
          Machine Learning Matcher
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-50 tracking-tight">
          Find your perfect <span className="text-brand-400">Vibe.</span>
        </h1>
        <p className="text-brand-400 max-w-2xl mx-auto">
          Adjust the sliders below to train our ML algorithm. We will calculate the Cosine Similarity against thousands of destinations to find your exact match.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: The Sliders */}
        <div className="rounded-2xl bg-brand-900/50 border border-brand-800 backdrop-blur-xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-800/50">
            <Sliders className="w-6 h-6 text-brand-400" />
            <h2 className="text-2xl font-display font-semibold text-brand-50">Set Parameters</h2>
          </div>

          <div className="space-y-6">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-brand-200 capitalize">
                    {key}
                  </label>
                  <span className="text-xs font-bold bg-brand-950 text-brand-400 px-2 py-1 rounded-md border border-brand-800">
                    {value.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  name={key}
                  min="1"
                  max="5"
                  step="0.5"
                  value={value}
                  onChange={handleSliderChange}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-500 bg-brand-950"
                />
                <div className="flex justify-between text-[10px] text-brand-500 font-medium uppercase tracking-wider">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={fetchRecommendations}
            disabled={loading}
            className="w-full mt-10 inline-flex items-center justify-center h-14 text-lg font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Calculating Vectors...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Discover Matches</>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: The Results */}
        <div className="space-y-4">
          <h3 className="text-xl font-display font-semibold text-brand-50 mb-6">Top 5 Matches</h3>
          
          <AnimatePresence>
            {recommendations.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-64 flex flex-col items-center justify-center text-brand-500 border border-dashed border-brand-800 rounded-2xl"
              >
                <Compass className="w-8 h-8 mb-3 opacity-50" />
                <p>Adjust the sliders and calculate your match.</p>
              </motion.div>
            )}

            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.destination}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl bg-brand-900/30 border border-brand-800 p-6 backdrop-blur-sm shadow-sm relative overflow-hidden group"
              >
                {/* Ranking Number */}
                <div className="absolute -right-4 -top-6 text-9xl font-display font-black text-brand-950/30 select-none pointer-events-none group-hover:text-brand-950/50 transition-colors">
                  {idx + 1}
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-2xl font-bold text-brand-50 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-400" />
                      {rec.destination}
                    </h4>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-brand-400">Match</span>
                      <span className="text-xl font-bold text-emerald-400">
                        {rec.match_percentage}%
                      </span>
                    </div>
                  </div>
                  
                  {/* The NLP Vibe Checker is perfectly integrated right here! */}
                  <VibeChecker placeName={rec.destination} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}