import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './AuthPage';
import BrandLogo from './components/BrandLogo';
import HeroSection from './components/HeroSection';
import PlanForm from './components/PlanForm';
import ItineraryView from './components/ItineraryView';
import AppFooter from './components/AppFooter';
import LegalModal from './components/LegalModal';
import { useTripPlanner } from './hooks/useTripPlanner';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading,
    error,
    itinerary,
    activeTab,
    activeModal,
    formData,
    setFormData,
    setActiveTab,
    setActiveModal,
    handleStartFresh,
    handleDownloadPDF,
    handleGenerate,
    toggleInterest,
    interestsOptions,
  } = useTripPlanner({ navigate });

  return (
    <div className="min-h-screen bg-brand-950 text-brand-50 selection:bg-brand-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-400/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <BrandLogo onClick={handleStartFresh} />
        <nav className="hidden md:flex gap-8 text-sm font-medium text-brand-400">
          <a href="#" className="hover:text-brand-50 transition-colors">Destinations</a>
          <a href="#" className="hover:text-brand-50 transition-colors">How it works</a>
          <a href="#" className="hover:text-brand-50 transition-colors">Pricing</a>
        </nav>
        <button 
          onClick={() => navigate('/auth')}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-brand-800 bg-transparent hover:bg-brand-900 text-brand-50 transition-colors"
        >
          Sign In
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HeroSection onStart={() => navigate('/plan')} />} />
            <Route
              path="/plan"
              element={
                <PlanForm
                  formData={formData}
                  setFormData={setFormData}
                  interestsOptions={interestsOptions}
                  toggleInterest={toggleInterest}
                  error={error}
                  loading={loading}
                  onGenerate={handleGenerate}
                />
              }
            />
            <Route
              path="/itinerary"
              element={
                <ItineraryView
                  itinerary={itinerary}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  navigate={navigate}
                  handleDownloadPDF={handleDownloadPDF}
                  handleStartFresh={handleStartFresh}
                  formData={formData}
                />
              }
            />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      <AppFooter setActiveModal={setActiveModal} />
      <LegalModal activeModal={activeModal} setActiveModal={setActiveModal} />
    </div>
  );
}