import React from 'react';
import { motion } from 'motion/react';
import { Clock, Download, Info, MapPin, PieChart, Trash2, Users } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function ItineraryView({
  itinerary,
  activeTab,
  setActiveTab,
  navigate,
  handleDownloadPDF,
  handleStartFresh,
  formData,
}) {
  if (!itinerary) {
    return <Navigate to="/plan" replace />;
  }

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-4">
            {itinerary.duration} Days in {itinerary.destination}
          </span>
          <h2 className="font-display text-5xl font-bold tracking-tight text-brand-50">
            {itinerary.destination}
          </h2>
        </div>
        <div className="flex gap-4">
          <button
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium border border-brand-800 bg-brand-900/50 text-brand-50 rounded-full transition-colors hover:bg-brand-800"
            onClick={() => navigate('/plan')}
          >
            Edit Plan
          </button>

          <button
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-full transition-colors"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" /> Save
          </button>

          <button className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-full transition-colors" onClick={handleStartFresh}>
            <Trash2 className="w-4 h-4 mr-2" /> Start New Trip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full">
            <div className="w-full overflow-x-auto whitespace-nowrap rounded-md mb-6 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="inline-flex bg-brand-900/50 border border-brand-800 p-1 rounded-lg">
                {itinerary.dailyPlans?.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveTab(day.day)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === day.day
                        ? 'bg-brand-50 text-brand-950 shadow-sm'
                        : 'text-brand-400 hover:text-brand-200'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>

            {itinerary.dailyPlans?.map((day) => (
              activeTab === day.day && (
                <div key={day.day} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-brand-900/30 border border-brand-800 rounded-2xl p-8 backdrop-blur-sm">
                    <h3 className="text-2xl font-display font-bold mb-2 flex items-center gap-3">
                      <span className="bg-brand-50 text-brand-950 w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0">
                        {day.day}
                      </span>
                      {day.theme}
                    </h3>
                    <div className="space-y-8 mt-8 relative before:absolute before:left-4.75 before:top-2 before:bottom-2 before:w-px before:bg-brand-800">
                      {day.activities?.map((activity, idx) => (
                        <div key={idx} className="relative pl-12">
                          <div className="absolute left-0 top-1.5 w-10 h-10 bg-brand-950 border border-brand-800 rounded-full flex items-center justify-center z-10">
                            <Clock className="w-4 h-4 text-brand-400" />
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                            <span className="text-brand-300 font-bold text-lg">{activity.time}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-brand-800 text-brand-400 bg-brand-950/50">
                              Cost: {activity.cost}
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-brand-50 mb-2">{activity.title}</h4>
                          <p className="text-brand-400 leading-relaxed mb-3">{activity.description}</p>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location + ', ' + itinerary.destination)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-brand-500 text-sm hover:text-brand-300 transition-colors w-fit group"
                          >
                            <MapPin className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="underline underline-offset-4 decoration-transparent group-hover:decoration-brand-500 transition-all">
                              {activity.location}
                            </span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {itinerary.budgetBreakdown && (
            <div className="rounded-xl bg-brand-900/50 border border-brand-800 backdrop-blur-xl shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b border-brand-800/50">
                <h3 className="text-xl font-display font-semibold text-brand-50 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-brand-400" />
                  Budget Breakdown
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-brand-800/50">
                  <span className="text-brand-400">Accommodation</span>
                  <span className="text-brand-50 font-medium">{itinerary.budgetBreakdown.accommodation}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-brand-800/50">
                  <span className="text-brand-400">Food & Dining</span>
                  <span className="text-brand-50 font-medium">{itinerary.budgetBreakdown.food}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-brand-800/50">
                  <span className="text-brand-400">Activities</span>
                  <span className="text-brand-50 font-medium">{itinerary.budgetBreakdown.activities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-400">Transportation</span>
                  <span className="text-brand-50 font-medium">{itinerary.budgetBreakdown.transport}</span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-brand-900/50 border border-brand-800 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-brand-800/50">
              <h3 className="text-xl font-display font-semibold text-brand-50 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-400" />
                Local Tips
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {itinerary.travelTips?.map((tip, i) => (
                <div key={i} className="flex gap-3 text-sm text-brand-400 leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-brand-900/50 border border-brand-800 backdrop-blur-xl shadow-sm overflow-hidden">
            <div className="h-48 bg-brand-800 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40" />
              <div className="relative z-10 text-center p-6 w-full">
                <p className="text-brand-50 font-bold text-lg mb-3">Ready for your adventure?</p>
                <button className="inline-flex w-full items-center justify-center px-4 py-2 font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-full transition-colors">
                  Book Flights & Hotels
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-brand-400 text-sm">Estimated Total Cost</span>
                <span className="text-brand-50 font-bold text-xl">{itinerary.currency} {itinerary.totalEstimatedCost}</span>
              </div>
              <hr className="border-t border-brand-800 mb-4" />
              <div className="flex items-center gap-3 text-sm text-brand-400">
                <Users className="w-4 h-4" />
                <span>Based on {formData.travelers} traveler(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
