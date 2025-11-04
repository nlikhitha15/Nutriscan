import React, { useState, useRef, useEffect } from 'react';
import { analyzeMealWithGemini } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';
import { MealAnalysis, UserProfile, LoggedNutrients } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { CameraIcon } from './icons/CameraIcon';

interface MealAnalyzerProps {
  userProfile: UserProfile;
  onLogMeal: (nutrients: LoggedNutrients) => void;
}

const MealAnalyzer: React.FC<MealAnalyzerProps> = ({ userProfile, onLogMeal }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allWarnings = analysis?.personalizedWarnings || [];
  const allergenWarnings = allWarnings.filter(w => w.type === 'allergen');
  const healthWarnings = allWarnings.filter(w => w.type === 'health_condition');

  useEffect(() => {
    // When a new analysis comes in, reset the log state
    if (analysis) {
      setIsLogged(false);
    }
  }, [analysis]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAnalysis(null);
      setError(null);
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const base64Image = await fileToBase64(file);
        const result = await analyzeMealWithGemini(base64Image, userProfile);
        setAnalysis(result);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogMeal = () => {
    if (!analysis) return;
    
    const loggedNutrients: LoggedNutrients = {
      macros: {
        calories: analysis.estimatedCalories,
        protein: analysis.macros.protein,
        carbohydrates: analysis.macros.carbohydrates,
        fat: analysis.macros.fat,
      },
      micros: {
        ...analysis.micronutrients
      }
    };

    onLogMeal(loggedNutrients);
    setIsLogged(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">AI Meal Analyzer</h2>
          <p className="mt-2 text-gray-600">Get instant, personalized analysis of your meals.</p>
          
          <div className="mt-4">
             <p className="mt-1 text-xs text-gray-500">For better accuracy, try adding a common object like a coin for scale in your photo.</p>
          </div>

          <div className="mt-6">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleCameraClick}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed"
            >
              <CameraIcon />
              <span>{isLoading ? 'Analyzing...' : 'Scan Your Meal'}</span>
            </button>
          </div>
        </div>
      </Card>

      {isLoading && (
          <Card>
            <div className="flex flex-col items-center gap-4">
                <Spinner />
                <p className="text-gray-600">Analyzing your meal, please wait...</p>
            </div>
          </Card>
      )}

      {error && <Card className="bg-red-50 border-red-500 border"><p className="text-red-700 text-center">{error}</p></Card>}

      {analysis && (
        <Card>
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{analysis.mealName}</h3>
            <button
              onClick={handleLogMeal}
              disabled={isLogged}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLogged ? 'Logged ✔' : 'Log Meal'}
            </button>
          </div>

          {imagePreview && <img src={imagePreview} alt="Meal preview" className="rounded-lg max-h-60 w-auto mx-auto my-4" />}
          
          <div className={`text-center p-4 rounded-lg mb-6 ${analysis.isRecommended ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'} border`}>
            <p className={`text-lg font-bold ${analysis.isRecommended ? 'text-green-800' : 'text-yellow-800'}`}>
              {analysis.isRecommended ? 'Recommended for you!' : 'Consider with caution'}
            </p>
          </div>
          
          {(allergenWarnings.length > 0 || healthWarnings.length > 0) && (
             <div className="mb-6 p-4 bg-orange-50 border border-orange-400 rounded-lg">
                <h4 className="font-bold text-orange-800">Personalized Warnings</h4>
                {allergenWarnings.length > 0 && (
                    <div className="mt-2">
                        <h5 className="font-semibold text-red-800">Allergen Alerts</h5>
                        <ul className="list-disc list-inside mt-1 text-red-700 text-sm">
                            {allergenWarnings.map((warning, index) => <li key={`allergen-${index}`}>{warning.message}</li>)}
                        </ul>
                    </div>
                )}
                 {healthWarnings.length > 0 && (
                    <div className={allergenWarnings.length > 0 ? "mt-3" : "mt-2"}>
                        <h5 className="font-semibold text-yellow-800">Health Advisories</h5>
                        <ul className="list-disc list-inside mt-1 text-yellow-700 text-sm">
                            {healthWarnings.map((warning, index) => <li key={`health-${index}`}>{warning.message}</li>)}
                        </ul>
                    </div>
                )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-500">Calories</p>
              <p className="text-xl font-bold text-emerald-700">{analysis.estimatedCalories.toFixed(0)} kcal</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-500">Macros (P/C/F)</p>
                <p className="text-lg font-semibold text-gray-800">{analysis.macros.protein.toFixed(0)}g / {analysis.macros.carbohydrates.toFixed(0)}g / {analysis.macros.fat.toFixed(0)}g</p>
            </div>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700 text-base">Identified Ingredients</h4>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                {analysis.ingredients.map((item, index) => (
                  <li key={index}>
                    {item.name}: <span className="font-semibold">{item.estimatedWeightGrams.toFixed(0)}g</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-base">Health Analysis</h4>
              <p className="text-gray-600">{analysis.healthAnalysis}</p>
            </div>
            {analysis.alternativeSuggestions && analysis.alternativeSuggestions.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-gray-700 text-base mb-2">💡 Alternative Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.alternativeSuggestions.map((suggestion, index) => (
                          <span key={index} className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
                            {suggestion}
                          </span>
                        ))}
                    </div>
                </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-700 text-base">Portion Advice</h4>
              <p className="text-gray-600">{analysis.portionAdvice}</p>
            </div>
            {analysis.micronutrients && Object.keys(analysis.micronutrients).length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-700 text-base">Estimated Micronutrients (Entire Meal)</h4>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(analysis.micronutrients).map(([key, value]) => {
                            if (value === undefined) return null;
                            const nutrientMap: { [key: string]: { label: string; unit: string } } = {
                                saturatedFat: { label: 'Saturated Fat', unit: 'g' },
                                cholesterol: { label: 'Cholesterol', unit: 'mg' },
                                sodium: { label: 'Sodium', unit: 'mg' },
                                potassium: { label: 'Potassium', unit: 'mg' },
                                fiber: { label: 'Fiber', unit: 'g' },
                                sugar: { label: 'Sugar', unit: 'g' },
                            };
                            const { label, unit } = nutrientMap[key] || { label: key, unit: 'g' };
                            return (
                                <div key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                    <span className="text-gray-700">{label}</span>
                                    <span className="font-semibold text-emerald-700">{value.toFixed(1)} {unit}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MealAnalyzer;