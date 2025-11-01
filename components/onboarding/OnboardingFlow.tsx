import React, { useState } from 'react';
import { UserProfile } from '../../types';
import StepIndicator from './StepIndicator';

interface OnboardingFlowProps {
  onProfileComplete: (profile: UserProfile) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: 'male',
    isDiabetic: false,
    hasHighBP: false,
    dietPreference: 'none',
    fitnessGoal: 'maintain_weight',
    allergies: ''
  });
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value ? parseFloat(value) : '') : value }));
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.heightCm && formData.weightKg;
      case 2:
        return true; // No validation needed for checkboxes
      case 3:
        return formData.dietPreference;
      case 4:
        return formData.fitnessGoal;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setError(null);
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setError('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
        onProfileComplete(formData as UserProfile);
    } else {
        setError('Please complete the final step.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">Your Body Metrics</h2>
                <p className="mt-1 text-gray-500">This helps us calculate your BMI and daily needs.</p>
                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" id="age" name="age" value={formData.age || ''} onChange={handleChange} placeholder="e.g., 25" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                        <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input type="number" id="heightCm" name="heightCm" value={formData.heightCm || ''} onChange={handleChange} placeholder="e.g., 175" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                        <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input type="number" id="weightKg" name="weightKg" value={formData.weightKg || ''} onChange={handleChange} placeholder="e.g., 70" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                </div>
            </div>
        );
      case 2:
        return (
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">Health Conditions</h2>
                <p className="mt-1 text-gray-500">Select any conditions that apply to you.</p>
                <div className="mt-6 space-y-4">
                    <div className="flex items-center">
                        <input id="isDiabetic" name="isDiabetic" type="checkbox" checked={formData.isDiabetic} onChange={handleChange} className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                        <label htmlFor="isDiabetic" className="ml-3 block text-sm font-medium text-gray-700">I am diabetic</label>
                    </div>
                    <div className="flex items-center">
                        <input id="hasHighBP" name="hasHighBP" type="checkbox" checked={formData.hasHighBP} onChange={handleChange} className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                        <label htmlFor="hasHighBP" className="ml-3 block text-sm font-medium text-gray-700">I have high blood pressure</label>
                    </div>
                </div>
            </div>
        );
      case 3:
        return (
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">Diet & Allergies</h2>
                <p className="mt-1 text-gray-500">Let us know about your dietary choices.</p>
                <div className="mt-6 space-y-4">
                     <div>
                        <label htmlFor="dietPreference" className="block text-sm font-medium text-gray-700">Dietary Preference</label>
                        <select id="dietPreference" name="dietPreference" value={formData.dietPreference} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="none">None</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="non-vegetarian">Non-Vegetarian</option>
                            <option value="vegan">Vegan</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Food Allergies</label>
                        <textarea id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} rows={3} placeholder="e.g., Peanuts, Shellfish, Gluten" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                    </div>
                </div>
            </div>
        );
      case 4:
        return (
             <div>
                <h2 className="text-2xl font-semibold text-gray-800">Fitness Goals</h2>
                <p className="mt-1 text-gray-500">What are you working towards?</p>
                 <div className="mt-6 space-y-2">
                    <label className={`flex items-center p-4 border rounded-md cursor-pointer ${formData.fitnessGoal === 'lose_weight' ? 'bg-emerald-50 border-emerald-500' : 'border-gray-300'}`}>
                        <input type="radio" name="fitnessGoal" value="lose_weight" checked={formData.fitnessGoal === 'lose_weight'} onChange={handleChange} className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500" />
                        <span className="ml-3 text-sm font-medium text-gray-700">Lose Weight</span>
                    </label>
                     <label className={`flex items-center p-4 border rounded-md cursor-pointer ${formData.fitnessGoal === 'maintain_weight' ? 'bg-emerald-50 border-emerald-500' : 'border-gray-300'}`}>
                        <input type="radio" name="fitnessGoal" value="maintain_weight" checked={formData.fitnessGoal === 'maintain_weight'} onChange={handleChange} className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500" />
                        <span className="ml-3 text-sm font-medium text-gray-700">Maintain Weight</span>
                    </label>
                     <label className={`flex items-center p-4 border rounded-md cursor-pointer ${formData.fitnessGoal === 'gain_muscle' ? 'bg-emerald-50 border-emerald-500' : 'border-gray-300'}`}>
                        <input type="radio" name="fitnessGoal" value="gain_muscle" checked={formData.fitnessGoal === 'gain_muscle'} onChange={handleChange} className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500" />
                        <span className="ml-3 text-sm font-medium text-gray-700">Gain Muscle</span>
                    </label>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-emerald-600">Set Up Your Profile</h1>
        <p className="mt-2 text-center text-gray-600">This will help us personalize your experience.</p>
        
        <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
            <form onSubmit={handleSubmit} className="mt-8">
                {renderStep()}
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                <div className="mt-8 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Back
                    </button>
                    {currentStep < totalSteps ? (
                         <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
