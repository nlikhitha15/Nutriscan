import React, { useState, useRef } from 'react';
import { analyzeMealWithGemini } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';
import { MealAnalysis, UserProfile } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { CameraIcon } from './icons/CameraIcon';

interface MealAnalyzerProps {
  userProfile: UserProfile;
}

const MealAnalyzer: React.FC<MealAnalyzerProps> = ({ userProfile }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">AI Meal Analyzer</h2>
          <p className="mt-2 text-gray-600">Get instant, personalized analysis of your meals.</p>
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

      {imagePreview && !analysis && !isLoading && (
        <Card>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Meal</h3>
          <img src={imagePreview} alt="Meal preview" className="rounded-lg max-h-80 w-auto mx-auto" />
        </Card>
      )}

      {analysis && (
        <Card>
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">{analysis.mealName}</h3>
          {imagePreview && <img src={imagePreview} alt="Meal preview" className="rounded-lg max-h-60 w-auto mx-auto mb-4" />}
          
          <div className={`text-center p-4 rounded-lg mb-6 ${analysis.isRecommended ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'} border`}>
            <p className={`text-lg font-bold ${analysis.isRecommended ? 'text-green-800' : 'text-yellow-800'}`}>
              {analysis.isRecommended ? 'Recommended for you!' : 'Consider with caution'}
            </p>
          </div>
          
          {analysis.personalizedWarnings && analysis.personalizedWarnings.length > 0 && (
             <div className="mb-6 p-4 bg-red-50 border border-red-400 rounded-lg">
                <h4 className="font-bold text-red-800">Personalized Warnings</h4>
                <ul className="list-disc list-inside mt-2 text-red-700 text-sm">
                    {analysis.personalizedWarnings.map((warning, index) => <li key={index}>{warning.message}</li>)}
                </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-500">Calories</p>
              <p className="text-xl font-bold text-emerald-700">{analysis.estimatedCalories} kcal</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-500">Macros (P/C/F)</p>
                <p className="text-lg font-semibold text-gray-800">{analysis.macros.protein}g / {analysis.macros.carbohydrates}g / {analysis.macros.fat}g</p>
            </div>
          </div>
          
          <div className="space-y-4 text-sm">
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
             <div>
              <h4 className="font-semibold text-gray-700 text-base">Identified Ingredients</h4>
              <ul className="list-disc list-inside text-gray-600">
                {analysis.ingredients.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MealAnalyzer;
