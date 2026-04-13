import React, { useState , useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import { 
  Plane, MapPin, Calendar, DollarSign, Users, ArrowRight, 
  Loader2, Clock, Info, Sparkles, AlertCircle, ChevronDown, PieChart, Trash2, Download
} from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export default function App() {
  const [step, setStep] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [activeModal, setActiveModal] = useState(null);
  
  const defaultForm = {
    destination: '',
    budget: '1000',
    duration: '3',
    travelers: '1',
    interests: []
  };
  const [formData, setFormData] = useState(defaultForm);

  const interestsOptions = [
    'Culture', 'Adventure', 'Food', 'Nature', 'Relaxation', 'History', 'Shopping', 'Nightlife'
  ];

  // 1. Check for saved trip when app opens
  useEffect(() => {
    const savedTrip = localStorage.getItem('voyageai_saved_trip');
    if (savedTrip) {
      try {
        const parsedData = JSON.parse(savedTrip);
        setItinerary(parsedData);
        setStep('result'); // Jump straight to results
      } catch (err) {
        console.error("Failed to load saved trip", err);
      }
    }
  }, []);

  // 2. Save the trip whenever it updates
  useEffect(() => {
    if (itinerary) {
      localStorage.setItem('voyageai_saved_trip', JSON.stringify(itinerary));
    }
  }, [itinerary]);

  // 3. Clear memory and start over
  const handleStartFresh = () => {
    localStorage.removeItem('voyageai_saved_trip');
    setItinerary(null);
    setFormData(defaultForm);
    setStep('hero');
  };

  // 4. Generate and Download PDF
  const handleDownloadPDF = () => {
    if (!itinerary) return;
    
    const doc = new jsPDF();
    let yPos = 20; // Starting vertical position
    const margin = 20;

    // Helper function so text doesn't run off the bottom of the page
    const checkPageBreak = (extraSpace = 10) => {
      if (yPos + extraSpace > 280) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Document Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`VoyageAI: ${itinerary.destination}`, margin, yPos);
    yPos += 15;

    // Budget Summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const summaryText = `Duration: ${itinerary.duration} Days | Est. Total: ${itinerary.currency} ${itinerary.totalEstimatedCost}`;
    doc.text(summaryText.replace(/₹/g, 'Rs. '), margin, yPos);
    yPos += 15;

    // Loop through the days and write the text
    itinerary.dailyPlans.forEach(day => {
      checkPageBreak(20);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${day.day}: ${day.theme}`, margin, yPos);
      yPos += 10;

      day.activities.forEach(act => {
        checkPageBreak(15);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const safeCost = act.cost.replace(/₹/g, 'Rs. '); 
        doc.text(`${act.time} - ${act.title} (${safeCost})`, margin, yPos);

        yPos += 6;

        doc.setFont("helvetica", "normal");
        // This splits long descriptions so they don't run off the right side of the page
        const splitDesc = doc.splitTextToSize(act.description, 170); 
        doc.text(splitDesc, margin, yPos);
        yPos += (splitDesc.length * 6) + 4; // Add dynamic spacing based on text length
      });
      yPos += 5; // Extra space between days
    });

    // Save the file using the destination name!
    const fileName = `${itinerary.destination.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
    doc.save(fileName);
  };

  // const handleGenerate = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     // 1. YOUR NEW EXPERT PROMPT

  //     // for budget X no. of people
  //     // You are an expert AI Travel Planner. Generate a detailed travel itinerary for ${formData.destination} for ${formData.duration} days for a group of ${formData.travelers} traveler(s). 
  //     // The budget is ₹${formData.budget} INR PER PERSON. This means your total allowed group budget is ₹${formData.budget * formData.travelers} INR. Please design the trip using this total combined figure. Please provide all costs and budget figures in Indian Rupees (INR). The traveler(s) are looking for ${formData.interests.length > 0 ? formData.interests.join(", ") : "general"} activities.

  //     // for total budget / no. of people
  //     const prompt = `You are an expert AI Travel Planner. Generate a detailed travel itinerary for ${formData.destination} for ${formData.duration} days for a group of ${formData.travelers} traveler(s). 
  //     The absolute maximum TOTAL budget for the ENTIRE GROUP combined is ₹${formData.budget} INR. You must divide this total budget realistically among the ${formData.travelers} people. Please provide all costs and budget figures in Indian Rupees (INR). The traveler(s) are looking for ${formData.interests.length > 0 ? formData.interests.join(", ") : "general"} activities.
      
  //     Your response must be a valid JSON object matching this structure:
  //     {
  //       "destination": string,
  //       "duration": number,
  //       "budget": string,
  //       "totalEstimatedCost": string,
  //       "currency": string,
  //       "dailyPlans": [
  //         {
  //           "day": number,
  //           "theme": string,
  //           "activities": [
  //             {
  //               "time": string,
  //               "title": string,
  //               "description": string,
  //               "cost": string,
  //               "location": string
  //             }
  //           ]
  //         }
  //       ],
  //       "travelTips": string[],
  //       "budgetBreakdown": {
  //         "accommodation": string,
  //         "food": string,
  //         "activities": string,
  //         "transport": string
  //       }
  //     }
      
  //     Use your knowledge of local prices and popular spots. Group activities logically (clustering) and ensure the total cost fits within the budget (regression-like estimation).`;

  //     // 2. YOUR EXACT JSON SCHEMA ENFORCEMENT
  //     const response = await ai.models.generateContent({
  //       model: "gemini-2.5-flash",
  //       contents: prompt,
  //       config: {
  //         responseMimeType: "application/json",
  //         responseSchema: {
  //           type: Type.OBJECT,
  //           properties: {
  //             destination: { type: Type.STRING },
  //             duration: { type: Type.NUMBER },
  //             budget: { type: Type.STRING },
  //             totalEstimatedCost: { type: Type.STRING },
  //             currency: { type: Type.STRING },
  //             dailyPlans: {
  //               type: Type.ARRAY,
  //               items: {
  //                 type: Type.OBJECT,
  //                 properties: {
  //                   day: { type: Type.NUMBER },
  //                   theme: { type: Type.STRING },
  //                   activities: {
  //                     type: Type.ARRAY,
  //                     items: {
  //                       type: Type.OBJECT,
  //                       properties: {
  //                         time: { type: Type.STRING },
  //                         title: { type: Type.STRING },
  //                         description: { type: Type.STRING },
  //                         cost: { type: Type.STRING },
  //                         location: { type: Type.STRING }
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             },
  //             travelTips: {
  //               type: Type.ARRAY,
  //               items: { type: Type.STRING }
  //             },
  //             budgetBreakdown: {
  //               type: Type.OBJECT,
  //               properties: {
  //                 accommodation: { type: Type.STRING },
  //                 food: { type: Type.STRING },
  //                 activities: { type: Type.STRING },
  //                 transport: { type: Type.STRING }
  //               }
  //             }
  //           },
  //           required: ["destination", "dailyPlans", "budgetBreakdown"]
  //         }
  //       }
  //     });

  //     if (!response.text) {
  //       throw new Error("No response from AI");
  //     }

  //     const data = JSON.parse(response.text);
  //     setItinerary(data);
  //     setActiveTab(1);
  //     setStep('result');
  //   } catch (err) {
  //     console.error('Error:', err);
  //     setError(err.message || "Failed to generate itinerary. Please check your API key and try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are an expert AI Travel Planner. Generate a detailed travel itinerary for ${formData.destination} for ${formData.duration} days for a group of ${formData.travelers} traveler(s). 
      The absolute maximum TOTAL budget for the ENTIRE GROUP combined is ₹${formData.budget} INR. You must divide this total budget realistically among the ${formData.travelers} people. Please provide all costs and budget figures in Indian Rupees (INR). The traveler(s) are looking for ${formData.interests.length > 0 ? formData.interests.join(", ") : "general"} activities.
      
      Your response must be a valid JSON object matching this structure:
      {
        "destination": string,
        "duration": number,
        "budget": string,
        "totalEstimatedCost": string,
        "currency": string,
        "dailyPlans": [
          {
            "day": number,
            "theme": string,
            "activities": [
              {
                "time": string,
                "title": string,
                "description": string,
                "cost": string,
                "location": string
              }
            ]
          }
        ],
        "travelTips": string[],
        "budgetBreakdown": {
          "accommodation": string,
          "food": string,
          "activities": string,
          "transport": string
        }
      }
      
      Use your knowledge of local prices and popular spots. Group activities logically (clustering) and ensure the total cost fits within the budget (regression-like estimation).`;

      // 1. EXTRACT SCHEMA CONFIGURATION (So we don't have to write it twice)
      const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            budget: { type: Type.STRING },
            totalEstimatedCost: { type: Type.STRING },
            currency: { type: Type.STRING },
            dailyPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  theme: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        cost: { type: Type.STRING },
                        location: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            travelTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            budgetBreakdown: {
              type: Type.OBJECT,
              properties: {
                accommodation: { type: Type.STRING },
                food: { type: Type.STRING },
                activities: { type: Type.STRING },
                transport: { type: Type.STRING }
              }
            }
          },
          required: ["destination", "dailyPlans", "budgetBreakdown"]
        }
      };

      let response;

      // 2. THE FALLBACK ARCHITECTURE
      try {
        // Attempt 1: Try the heavier Pro model first
        console.log("Attempting Primary Model (Pro)...");
        response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
          config: generationConfig
        });
      } catch (primaryError) {
        console.warn("Primary model failed. Triggering automated fallback to Flash...", primaryError);
        
        try {
          // Attempt 2: If Pro is overloaded (503 error), immediately fallback to Flash
          console.log("Attempting Fallback Model (Flash)...");
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: generationConfig
          });
        } catch (fallbackError) {
          // Attempt 3: Total server failure
          console.error("Critical: Both AI models failed.", fallbackError);
          throw new Error("Our AI servers are experiencing extremely high traffic right now. Please try generating your trip again in a few moments!");
        }
      }

      if (!response || !response.text) {
        throw new Error("No data returned from AI servers.");
      }

      const data = JSON.parse(response.text);
      setItinerary(data);
      setActiveTab(1);
      setStep('result');
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || "Failed to generate itinerary. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen bg-brand-950 text-brand-50 selection:bg-brand-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-400/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tight cursor-pointer" onClick={handleStartFresh}>
          <div className="bg-brand-50 text-brand-950 p-1.5 rounded-lg">
            <Plane className="w-5 h-5" />
          </div>
          VoyageAI
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-brand-400">
          <a href="#" className="hover:text-brand-50 transition-colors">Destinations</a>
          <a href="#" className="hover:text-brand-50 transition-colors">How it works</a>
          <a href="#" className="hover:text-brand-50 transition-colors">Pricing</a>
        </nav>
        <button className="px-4 py-2 text-sm font-medium rounded-lg border border-brand-800 bg-transparent hover:bg-brand-900 text-brand-50 transition-colors">
          Sign In
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'hero' && (
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
                onClick={() => setStep('form')}
              >
                Start Planning <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'form' && (
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
                  
                  {/* 1. RESTORED: Destination Search Bar */}
                  <div className="space-y-2">
                    <label htmlFor="destination" className="text-sm font-medium text-brand-200">Where do you want to go?</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-brand-500 pointer-events-none" />
                      <input 
                        id="destination" 
                        placeholder="e.g. Mumbai, India" 
                        className="flex h-12 w-full rounded-lg border border-brand-800 bg-brand-950/50 px-3 pl-10 py-2 text-sm text-brand-50 placeholder:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        value={formData.destination}
                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* 2. Duration Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-200">Duration (Days)</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-brand-500 pointer-events-none" />
                      <select 
                        value={formData.duration} 
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="flex h-12 w-full appearance-none rounded-lg border border-brand-800 bg-brand-950/50 px-3 pl-10 pr-10 py-2 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 7, 10, 14].map(d => (
                          <option key={d} value={d} className="bg-brand-950 text-brand-50">{d} {d === 1 ? 'Day' : 'Days'}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-brand-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* 3. NEW: Travelers Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-brand-200">Number of Travelers</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <button
                          key={num}
                          onClick={() => setFormData({...formData, travelers: num.toString()})}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                            formData.travelers === num.toString()
                              ? 'bg-brand-50 text-brand-950 shadow-sm' // Active state (Bright)
                              : 'bg-brand-950/50 border border-brand-800 text-brand-400 hover:border-brand-600' // Inactive state (Dark)
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. NEW: Budget Slider (Old Dropdown Removed) */}
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
                        onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                        className="flex-grow h-2 rounded-full appearance-none cursor-pointer accent-brand-500 transition-all"
                        style={{
                          background: `linear-gradient(to right, #f9fafb ${((formData.budget - 1000) / 99000) * 100}%, #1e293b ${((formData.budget - 1000) / 99000) * 100}%)`
                        }}
                      />
                      <div className="min-w-28 h-10 px-4 flex items-center justify-end font-bold text-lg bg-brand-900 border border-brand-800 text-brand-50 rounded-lg shadow-inner">
                        {formData.budget.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* 5. Interests Picker */}
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

                  {/* 6. Generate Button */}
                  <button 
                    className="inline-flex w-full items-center justify-center h-14 text-lg font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerate}
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
          )}

          {step === 'result' && itinerary && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
                    onClick={() => setStep('form')}
                  >
                    Edit Plan
                  </button>

                  {/* <button className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-full transition-colors">
                    Save Itinerary
                  </button> */}

                  <button 
                    className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium bg-brand-50 text-brand-950 hover:bg-brand-200 rounded-full transition-colors"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-4 h-4 mr-2" /> Save
                  </button>

                  <button className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-full transition-colors"
                    onClick={handleStartFresh}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Start New Trip
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="w-full">
                    {/* Tabs List */}
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

                    {/* Tabs Content */}
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
                            <div className="space-y-8 mt-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-brand-800">
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
                                  <div className="flex items-center gap-2 text-brand-500 text-sm">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    {activity.location}
                                  </div>
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
                  
                  {/* Budget Breakdown Card */}
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

                  {/* Travel Tips Card */}
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

                  {/* Booking Card */}
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
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-brand-900 mt-20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="bg-brand-50 text-brand-950 p-1 rounded-lg">
              <Plane className="w-4 h-4" />
            </div>
            VoyageAI
          </div>

          {/* <div className="flex gap-8 text-sm text-brand-500">
            <a href="#" className="hover:text-brand-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-300 transition-colors">Contact</a>
          </div> */}

          <div className="flex gap-8 text-sm text-brand-500">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-brand-300 transition-colors bg-transparent border-none p-0 cursor-pointer">Privacy Policy</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-brand-300 transition-colors bg-transparent border-none p-0 cursor-pointer">Terms of Service</button>
            <button onClick={() => setActiveModal('contact')} className="hover:text-brand-300 transition-colors bg-transparent border-none p-0 cursor-pointer">Contact</button>
          </div>

          <p className="text-sm text-brand-500">
            © 2026 VoyageAI. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* LEGAL & CONTACT MODALS */}
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
              
              {/* privacy policy */}
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

              {/* terms of service */}
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

              {/* contacts */}
              {activeModal === 'contact' && (
                <div className="space-y-6 text-brand-300 text-sm leading-relaxed text-center">
                  <h2 className="text-3xl font-display font-bold text-brand-50 mb-2">Get in Touch</h2>
                  <p className="text-brand-400 mb-8 text-base">Have a question or want to collaborate? Reach out to us at either of the addresses below!</p>
                  
                  <div className="flex flex-col gap-4">
                    <a href="mailto:developer@example.com" className="flex items-center justify-center p-5 bg-brand-950/50 border border-brand-800 rounded-xl hover:border-brand-500 hover:bg-brand-900 transition-all group">
                      <div className="flex flex-col">
                        <span className="text-brand-50 font-bold text-lg group-hover:text-brand-400 transition-colors">Supriyo Suvam</span>
                        <span className="text-brand-500 text-xs mt-1">For technical questions & collaborations</span>
                      </div>
                    </a>

                    <a href="mailto:support@example.com" className="flex items-center justify-center p-5 bg-brand-950/50 border border-brand-800 rounded-xl hover:border-brand-500 hover:bg-brand-900 transition-all group">
                      <div className="flex flex-col">
                        <span className="text-brand-50 font-bold text-lg group-hover:text-brand-400 transition-colors">Mitali Swaroop</span>
                        <span className="text-brand-500 text-xs mt-1">For general inquiries & feedback</span>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}