import React from 'react';
import BrandLogo from './BrandLogo';

export default function AppFooter({ setActiveModal }) {
  return (
    <footer className="relative z-10 border-t border-brand-900 mt-20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <BrandLogo size="sm" />

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
  );
}
