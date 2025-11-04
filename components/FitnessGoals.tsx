import React from 'react';
import { UserProfile, NutritionGoals } from '../types';
import Card from './common/Card';
import ProgressBar from './common/ProgressBar';

interface FitnessGoalsProps {
  userProfile: UserProfile;
  dailyLog: NutritionGoals;
}

const MacroGoalRow: React.FC<{ label: string; consumed: number; goal: number; unit: string; color: string }> = ({ label, consumed, goal, unit, color }) => (
    <div>
        <div className="flex justify-between mb-1 text-sm">
            <span className="font-semibold text-gray-700">{label}</span>
            <span className="text-gray-600">
                <span className="font-bold text-gray-800">{consumed.toFixed(0)}</span> / {goal}{unit}
            </span>
        </div>
        <ProgressBar value={consumed} max={goal} color={color} />
    </div>
);


const MicroGoalRow: React.FC<{ label: string; consumed: number; goal: number; unit: string; }> = ({ label, consumed, goal, unit }) => (
    <div className="flex justify-between py-2 border-b">
        <span className="text-gray-600">{label}</span>
        <div className="flex items-center">
            <span className="font-semibold text-gray-800">{consumed.toFixed(0)}</span>
            <span className="text-gray-500 w-20 text-right">/ {goal} {unit}</span>
        </div>
    </div>
);


const FitnessGoals: React.FC<FitnessGoalsProps> = ({ userProfile, dailyLog }) => {
    const { nutritionGoals } = userProfile;

    if (!nutritionGoals) {
        return (
            <div className="p-4 md:p-6">
                <Card>
                    <p className="text-center text-gray-600">Nutrition goals have not been set up yet.</p>
                </Card>
            </div>
        );
    }
    
    const { macros, micros } = nutritionGoals;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center">Your Daily Progress</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-700">Macronutrients</h3>
                        <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">EDIT</button>
                    </div>
                    
                    {/* Prominent Calorie Display */}
                    <div className="text-center my-4 p-4 bg-emerald-50 rounded-lg">
                        <p className="text-gray-600 text-lg">Calories</p>
                        <div>
                            <span className="text-4xl font-bold text-emerald-700">{dailyLog.macros.calories.toFixed(0)}</span>
                            <span className="text-xl text-gray-500"> / {macros.calories} kcal</span>
                        </div>
                        <div className="mt-2">
                            <ProgressBar value={dailyLog.macros.calories} max={macros.calories} />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <MacroGoalRow label="Carbohydrates" consumed={dailyLog.macros.carbohydrates} goal={macros.carbohydrates} unit="g" color="bg-sky-500" />
                        <MacroGoalRow label="Protein" consumed={dailyLog.macros.protein} goal={macros.protein} unit="g" color="bg-rose-500" />
                        <MacroGoalRow label="Fat" consumed={dailyLog.macros.fat} goal={macros.fat} unit="g" color="bg-amber-500" />
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-700">Micronutrients</h3>
                        <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">EDIT</button>
                    </div>
                     <div className="space-y-1 text-sm">
                        <MicroGoalRow label="Saturated Fat" consumed={dailyLog.micros.saturatedFat} goal={micros.saturatedFat} unit="g" />
                        <MicroGoalRow label="Polyunsaturated Fat" consumed={dailyLog.micros.polyunsaturatedFat} goal={micros.polyunsaturatedFat} unit="g" />
                        <MicroGoalRow label="Monounsaturated Fat" consumed={dailyLog.micros.monounsaturatedFat} goal={micros.monounsaturatedFat} unit="g" />
                        <MicroGoalRow label="Trans Fat" consumed={dailyLog.micros.transFat} goal={micros.transFat} unit="g" />
                        <MicroGoalRow label="Cholesterol" consumed={dailyLog.micros.cholesterol} goal={micros.cholesterol} unit="mg" />
                        <MicroGoalRow label="Sodium" consumed={dailyLog.micros.sodium} goal={micros.sodium} unit="mg" />
                        <MicroGoalRow label="Potassium" consumed={dailyLog.micros.potassium} goal={micros.potassium} unit="mg" />
                        <MicroGoalRow label="Fiber" consumed={dailyLog.micros.fiber} goal={micros.fiber} unit="g" />
                        <MicroGoalRow label="Sugar" consumed={dailyLog.micros.sugar} goal={micros.sugar} unit="g" />
                        <MicroGoalRow label="Vitamin A" consumed={dailyLog.micros.vitaminA} goal={micros.vitaminA} unit="mcg" />
                        <MicroGoalRow label="Vitamin C" consumed={dailyLog.micros.vitaminC} goal={micros.vitaminC} unit="mg" />
                        <MicroGoalRow label="Calcium" consumed={dailyLog.micros.calcium} goal={micros.calcium} unit="mg" />
                        <MicroGoalRow label="Iron" consumed={dailyLog.micros.iron} goal={micros.iron} unit="mg" />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FitnessGoals;