import React from 'react';
import { BusinessType } from './types';

interface HomeScreenProps {
  onSelectBusiness: (business: BusinessType) => void;
}

const PuanLogo = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    {/* Woven fabric pattern */}
    <rect x="8" y="8" width="48" height="48" rx="6" fill="#0ea5e9" opacity="0.15"/>
    <rect x="12" y="12" width="40" height="40" rx="4" fill="#0ea5e9" opacity="0.25"/>
    {/* Horizontal weave lines */}
    <line x1="14" y1="20" x2="50" y2="20" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="14" y1="28" x2="50" y2="28" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="14" y1="36" x2="50" y2="36" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="14" y1="44" x2="50" y2="44" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Vertical weave lines */}
    <line x1="22" y1="14" x2="22" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    <line x1="32" y1="14" x2="32" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    <line x1="42" y1="14" x2="42" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    {/* Diamond accent (Mizo pattern) */}
    <polygon points="32,18 38,32 32,46 26,32" fill="none" stroke="#0c4a6e" strokeWidth="1.5"/>
  </svg>
);

const CakeLogo = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    {/* Cake base */}
    <rect x="12" y="34" width="40" height="20" rx="4" fill="#f472b6"/>
    <rect x="12" y="34" width="40" height="8" rx="4" fill="#ec4899"/>
    {/* Cake top layer */}
    <rect x="16" y="22" width="32" height="14" rx="4" fill="#fb7185"/>
    <rect x="16" y="22" width="32" height="6" rx="4" fill="#f43f5e"/>
    {/* Frosting drips */}
    <circle cx="20" cy="34" r="3" fill="#fce7f3"/>
    <circle cx="32" cy="35" r="3.5" fill="#fce7f3"/>
    <circle cx="44" cy="34" r="3" fill="#fce7f3"/>
    {/* Cherry on top */}
    <circle cx="32" cy="18" r="5" fill="#e11d48"/>
    <path d="M32 13 Q35 8 38 10" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Sparkles */}
    <circle cx="14" cy="16" r="1.5" fill="#fbbf24"/>
    <circle cx="50" cy="20" r="1.5" fill="#fbbf24"/>
    <circle cx="48" cy="12" r="1" fill="#fbbf24"/>
  </svg>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectBusiness }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">📋 Order Tracker</h1>
        <p className="text-gray-400 text-sm">Select your business</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        {/* Nihawi Puan Card */}
        <button
          onClick={() => onSelectBusiness('puan')}
          className="w-full bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4 active:scale-[0.97] transition-transform border border-sky-100"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <PuanLogo />
          </div>
          <div className="text-left flex-1">
            <h2 className="text-lg font-bold text-gray-800">Nihawi Puan</h2>
            <p className="text-sm text-sky-600 font-medium">Traditional Mizo Textiles</p>
            <p className="text-xs text-gray-400 mt-0.5">Track puan sales & orders</p>
          </div>
          <div className="text-sky-400 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Cake-A-Licious Card */}
        <button
          onClick={() => onSelectBusiness('cake')}
          className="w-full bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4 active:scale-[0.97] transition-transform border border-pink-100"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <CakeLogo />
          </div>
          <div className="text-left flex-1">
            <h2 className="text-lg font-bold text-gray-800">Cake-A-Licious</h2>
            <p className="text-sm text-pink-600 font-medium">Freshly Baked Goodness</p>
            <p className="text-xs text-gray-400 mt-0.5">Track cake orders & baking</p>
          </div>
          <div className="text-pink-400 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-gray-300">Made with ❤️ for sisters</p>
    </div>
  );
};

export default HomeScreen;
