import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Calendar, ChevronDown, Loader2, MapPin } from 'lucide-react';

export default function PlanForm({
  formData,
  setFormData,
  interestsOptions,
  toggleInterest,
  error,
  loading,
  onGenerate,
}) {
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-xl bg-brand-900/50 border border-brand-800 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-brand-800/50">
          <h3 className="text-2xl font-display font-semibold text-brand-50">Tell us about your trip</h3>
          <p className="text-sm text-brand-400">We'll use this to craft your personalized itinerary.</p>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-2">
            <label htmlFor="destination" className="text-sm font-medium text-brand-200">Where do you want to go?</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-brand-500 pointer-events-none" />
              <input
                id="destination"
                placeholder="e.g. Mumbai, India"
                className="flex h-12 w-full rounded-lg border border-brand-800 bg-brand-950/50 px-3 pl-10 py-2 text-sm text-brand-50 placeholder:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-200">Duration (Days)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-brand-500 pointer-events-none" />
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="flex h-12 w-full appearance-none rounded-lg border border-brand-800 bg-brand-950/50 px-3 pl-10 pr-10 py-2 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 7, 10, 14].map(d => (
                  <option key={d} value={d} className="bg-brand-950 text-brand-50">{d} {d === 1 ? 'Day' : 'Days'}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-brand-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-brand-200">Number of Travelers</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  onClick={() => setFormData({ ...formData, travelers: num.toString() })}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    formData.travelers === num.toString()
                      ? 'bg-brand-50 text-brand-950 shadow-sm'
                      : 'bg-brand-950/50 border border-brand-800 text-brand-400 hover:border-brand-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-200">Approximate Budget (₹)</label>
            <div className="flex items-center gap-4 h-12 p-1.5 rounded-lg border border-brand-800 bg-brand-950/50">
              <div className="w-10 h-10 flex items-center justify-center font-display text-2xl font-bold bg-brand-900 border border-brand-800 text-brand-400 rounded-lg shadow-inner">
                ₹
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="500"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                className="grow h-2 rounded-full appearance-none cursor-pointer accent-brand-500 transition-all"
                style={{
                  background: `linear-gradient(to right, #f9fafb ${((formData.budget - 1000) / 99000) * 100}%, #1e293b ${((formData.budget - 1000) / 99000) * 100}%)`
                }}
              />
              <div className="min-w-28 h-10 px-4 flex items-center justify-end font-bold text-lg bg-brand-900 border border-brand-800 text-brand-50 rounded-lg shadow-inner">
                {formData.budget.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-brand-200">What are you interested in?</label>
            <div className="flex flex-wrap gap-2">
              {interestsOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-brand-50 text-brand-950'
                      : 'bg-brand-950/50 border border-brand-800 text-brand-400 hover:border-brand-600'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <button
            className="inline-flex w-full items-center justify-center h-14 text-lg font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onGenerate}
            disabled={loading || !formData.destination}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Crafting your journey...
              </>
            ) : (
              'Generate Itinerary'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
