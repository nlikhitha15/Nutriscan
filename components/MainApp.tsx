import React, { useState } from 'react';
import { UserProfile, NutritionGoals, LoggedNutrients } from '../types';
import BarcodeScanner from './BarcodeScanner';
import MealAnalyzer from './MealAnalyzer';
import { LogoutIcon } from './icons/LogoutIcon';
import { ScanIcon } from './icons/ScanIcon';
import { CameraIcon } from './icons/CameraIcon';
import { GoalsIcon } from './icons/GoalsIcon';
import FitnessGoals from './FitnessGoals';

interface MainAppProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

type ActiveTab = 'scanner' | 'analyzer' | 'goals';

const getInitialDailyLog = (): NutritionGoals => ({
    macros: { calories: 0, carbohydrates: 0, fat: 0, protein: 0 },
    micros: {
        saturatedFat: 0, polyunsaturatedFat: 0, monounsaturatedFat: 0,
        transFat: 0, cholesterol: 0, sodium: 0, potassium: 0,
        fiber: 0, sugar: 0, vitaminA: 0, vitaminC: 0,
        calcium: 0, iron: 0
    }
});

const MainApp: React.FC<MainAppProps> = ({ userProfile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const [dailyLog, setDailyLog] = useState<NutritionGoals>(getInitialDailyLog());

  const handleLogNutrients = (nutrients: LoggedNutrients) => {
    setDailyLog(prevLog => {
        const newLog = JSON.parse(JSON.stringify(prevLog)); // Deep copy

        // Add macros
        for (const key in nutrients.macros) {
            const macroKey = key as keyof typeof nutrients.macros;
            if (nutrients.macros[macroKey]) {
                newLog.macros[macroKey] += nutrients.macros[macroKey]!;
            }
        }

        // Add micros
        for (const key in nutrients.micros) {
            const microKey = key as keyof typeof nutrients.micros;
            if (nutrients.micros[microKey]) {
                newLog.micros[microKey] += nutrients.micros[microKey]!;
            }
        }
        
        return newLog;
    });
  };

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
        {activeTab === 'analyzer' && <MealAnalyzer userProfile={userProfile} onLogMeal={handleLogNutrients} />}
        {activeTab === 'scanner' && <BarcodeScanner userProfile={userProfile} onLogProduct={handleLogNutrients} />}
        {activeTab === 'goals' && <FitnessGoals userProfile={userProfile} dailyLog={dailyLog} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg">
        <div className="max-w-4xl mx-auto flex">
            <TabButton tabId="analyzer" icon={<CameraIcon />} label="Meal Analyzer" />
            <TabButton tabId="scanner" icon={<ScanIcon />} label="Barcode Scan" />
            <TabButton tabId="goals" icon={<GoalsIcon />} label="My Goals" />
        </div>
      </nav>
    </div>
  );
};

export default MainApp;
