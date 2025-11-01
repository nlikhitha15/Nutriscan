import React, { useState } from 'react';
import { UserProfile } from '../types';
import BarcodeScanner from './BarcodeScanner';
import MealAnalyzer from './MealAnalyzer';
import { LogoutIcon } from './icons/LogoutIcon';
import { ScanIcon } from './icons/ScanIcon';
import { CameraIcon } from './icons/CameraIcon';

interface MainAppProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

type ActiveTab = 'scanner' | 'analyzer';

const MainApp: React.FC<MainAppProps> = ({ userProfile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');

  const TabButton: React.FC<{
    tabId: ActiveTab;
    icon: React.ReactNode;
    label: string;
  }> = ({ tabId, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 flex flex-col items-center justify-center p-3 text-sm font-medium transition-colors ${
        activeTab === tabId
          ? 'bg-emerald-100 text-emerald-700'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-emerald-600">Nutri-Vision AI</h1>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-24">
        {activeTab === 'analyzer' && <MealAnalyzer userProfile={userProfile} />}
        {activeTab === 'scanner' && <BarcodeScanner userProfile={userProfile} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg">
        <div className="max-w-4xl mx-auto flex">
            <TabButton tabId="analyzer" icon={<CameraIcon />} label="Meal Analyzer" />
            <TabButton tabId="scanner" icon={<ScanIcon />} label="Barcode Scan" />
        </div>
      </nav>
    </div>
  );
};

export default MainApp;