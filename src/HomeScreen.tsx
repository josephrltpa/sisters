import React from 'react';
import { BusinessType } from './types';

interface HomeScreenProps {
  onSelectBusiness: (business: BusinessType) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectBusiness }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Order Tracker</h1>
        <p className="text-gray-500 text-sm">Select your business</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        {/* Mizo Puan Card */}
        <button
          onClick={() => onSelectBusiness('puan')}
          className="w-full bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 active:scale-95 transition-transform border-2 border-transparent hover:border-purple-300"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center text-3xl shadow-md">
            🧵
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-800">Mizo Puan</h2>
            <p className="text-sm text-gray-500">Track puan sales & orders</p>
          </div>
          <div className="ml-auto text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Cake Card */}
        <button
          onClick={() => onSelectBusiness('cake')}
          className="w-full bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 active:scale-95 transition-transform border-2 border-transparent hover:border-pink-300"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-3xl shadow-md">
            🎂
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-800">Cake Orders</h2>
            <p className="text-sm text-gray-500">Track cake orders & baking</p>
          </div>
          <div className="ml-auto text-pink-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-gray-400">Made with ❤️ for sisters</p>
    </div>
  );
};

export default HomeScreen;
