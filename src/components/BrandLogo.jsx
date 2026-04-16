import React from 'react';
import { Plane } from 'lucide-react';

export default function BrandLogo({ onClick, size = 'lg' }) {
  const iconClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textClass = size === 'sm' ? 'text-xl' : 'text-2xl';
  const paddingClass = size === 'sm' ? 'p-1' : 'p-1.5';

  return (
    <div
      className={`flex items-center gap-2 font-display font-bold ${textClass} tracking-tight ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`bg-brand-50 text-brand-950 ${paddingClass} rounded-lg`}>
        <Plane className={iconClass} />
      </div>
      VoyageAI
    </div>
  );
}
