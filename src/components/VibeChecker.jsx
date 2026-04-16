import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function VibeChecker({ placeName }) {
  const [vibe, setVibe] = useState(null);
  const [loading, setLoading] = useState(false);

  const runVibeCheck = async () => {
    setLoading(true);
    try {
      // ⚠️ UPDATE THIS URL TO YOUR RENDER URL
      const response = await fetch("https://voyage-ml-api.onrender.com/vibe-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_name: placeName })
      });
      const data = await response.json();
      setVibe(data);
    } catch (error) {
      console.error("Vibe Check Failed", error);
      setVibe({ vibe_label: "Connection Error", vibe_score: 0, reviews_analyzed: 0 });
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 border-t border-brand-800/50 pt-4">
      {!vibe && (
        <button 
          onClick={runVibeCheck} 
          disabled={loading}
          className="inline-flex w-full justify-center items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-900/50 text-brand-300 border border-brand-800 hover:bg-brand-800 hover:text-brand-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Live Reviews...</>
          ) : (
            <><Sparkles className="w-4 h-4 text-brand-400" /> Run AI Vibe Check</>
          )}
        </button>
      )}

      {vibe && (
        <div className="flex flex-col gap-2 p-3 bg-brand-950 border border-brand-800 rounded-lg animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
            <span className="font-bold text-brand-50 text-base">{vibe.vibe_label}</span>
            <span className={`font-medium px-2.5 py-1 rounded-full text-xs ${
              vibe.vibe_score >= 75 ? 'text-emerald-400 bg-emerald-500/10' : 
              vibe.vibe_score >= 40 ? 'text-yellow-400 bg-yellow-500/10' : 
              'text-red-400 bg-red-500/10'
            }`}>
              {vibe.vibe_score}% Positive
            </span>
          </div>
          <span className="text-brand-500 text-xs">
            Based on {vibe.reviews_analyzed} recent traveler reviews.
          </span>
        </div>
      )}
    </div>
  );
}