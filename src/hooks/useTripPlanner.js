import { useEffect, useState } from 'react';
import { downloadItineraryPdf } from '../lib/itineraryPdf';

const SAVED_TRIP_KEY = 'voyageai_saved_trip';

export const DEFAULT_FORM = {
  destination: '',
  budget: '1000',
  duration: '3',
  travelers: '1',
  interests: []
};

export const INTERESTS_OPTIONS = [
  'Culture', 'Adventure', 'Food', 'Nature', 'Relaxation', 'History', 'Shopping', 'Nightlife'
];

export function useTripPlanner({ navigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    const savedTrip = localStorage.getItem(SAVED_TRIP_KEY);
    if (savedTrip) {
      try {
        const parsedData = JSON.parse(savedTrip);
        setItinerary(parsedData);
        navigate('/itinerary');
      } catch (err) {
        console.error('Failed to load saved trip', err);
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (itinerary) {
      localStorage.setItem(SAVED_TRIP_KEY, JSON.stringify(itinerary));
    }
  }, [itinerary]);

  const handleStartFresh = () => {
    localStorage.removeItem(SAVED_TRIP_KEY);
    setItinerary(null);
    setFormData(DEFAULT_FORM);
    navigate('/');
  };

  const handleDownloadPDF = () => {
    downloadItineraryPdf(itinerary);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.destination,
          duration: Number(formData.duration),
          travelers: Number(formData.travelers),
          budget: Number(formData.budget),
          interests: formData.interests,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate itinerary');
      }

      setItinerary(data);
      setActiveTab(1);
      navigate('/itinerary');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate itinerary. Please check your API key and try again.');
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

  return {
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
    interestsOptions: INTERESTS_OPTIONS,
  };
}
