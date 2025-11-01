import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
                <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : isCompleted ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-200 text-gray-500'
                }`}
                >
                {isCompleted ? '✓' : step}
                </div>
            </div>
            {step < totalSteps && <div className={`flex-auto border-t-2 transition-colors ${isCompleted || isActive ? 'border-emerald-500' : 'border-gray-200'}`}></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
