import { UserProfile, NutritionGoals } from '../types';

export const calculateDefaultGoals = (profile: Omit<UserProfile, 'nutritionGoals'>): NutritionGoals => {
  // 1. Calculate BMR using the Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) + 5;
  } else if (profile.gender === 'female') {
    bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) - 161;
  } else {
    // A gender-neutral average as a fallback
    bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) - 78;
  }

  // 2. Calculate TDEE (Total Daily Energy Expenditure) based on activity level
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };
  let tdee = bmr * activityMultipliers[profile.activityLevel];

  // 3. Set base macronutrient and micronutrient goals (RDA/general guidelines)
  let macroSplit = { C: 0.45, P: 0.25, F: 0.30 }; // Default split
  
  // Base micronutrient goals based on FDA and NIH recommendations
  const micros = {
      saturatedFat: 20, // g (AHA recommends <6% of calories, ~13g for 2000kcal)
      polyunsaturatedFat: 22, // g
      monounsaturatedFat: 50, // g
      transFat: 0, // g
      cholesterol: 300, // mg
      sodium: 2300, // mg
      potassium: 4700, // mg (Adequate Intake)
      fiber: 28, // g (for 2000 kcal diet)
      sugar: 50, // g (FDA)
      vitaminA: profile.gender === 'male' ? 900 : 700, // mcg RAE
      vitaminC: profile.gender === 'male' ? 90 : 75, // mg
      calcium: 1000, // mg
      iron: profile.gender === 'male' ? 8 : 18, // mg (pre-menopause for women)
  };


  // 4. Adjust goals based on specific health conditions
  if (profile.isDiabetic || profile.hasPCOS) {
    // Lower carb, higher protein/fat is often recommended
    macroSplit = { C: 0.45, P: 0.30, F: 0.25 };
    micros.sugar = 30; // Stricter sugar limit
  }
  if (profile.hasHighBP) {
    // Align with DASH diet recommendations
    micros.sodium = 1500; // Lower sodium
    micros.potassium = 4700; // Ensure high potassium
  }
  if (profile.hasHighCholesterol) {
    // Stricter limits on fats
    micros.saturatedFat = 15; // < 7% of 2000 kcal diet is ~15g
  }
  if (profile.isPregnant) {
    tdee += 300; // Estimated additional calories needed
    macroSplit = { C: 0.45, P: 0.30, F: 0.25 }; // Increased protein needs
    micros.iron = 27; // mg (RDA for pregnancy)
    micros.calcium = 1300; // mg
  }
  if (profile.isBreastfeeding) {
    tdee += 450; // Estimated additional calories needed
    macroSplit = { C: 0.50, P: 0.25, F: 0.25 }; // Higher carb for energy, protein still high
    micros.iron = 10; // mg
    micros.calcium = 1300; // mg
  }

  // 5. Adjust final calorie goal based on fitness goal
  let calorieGoal: number;
  switch (profile.fitnessGoal) {
    case 'lose_weight':
      calorieGoal = tdee - 500;
      break;
    case 'gain_muscle':
      calorieGoal = tdee + 400;
      break;
    case 'maintain_weight':
    default:
      calorieGoal = tdee;
  }

  // 6. Calculate final macronutrient goals in grams
  const proteinGrams = Math.round((calorieGoal * macroSplit.P) / 4);
  const fatGrams = Math.round((calorieGoal * macroSplit.F) / 9);
  const carbGrams = Math.round((calorieGoal * macroSplit.C) / 4);
  
  return {
    macros: {
      calories: Math.round(calorieGoal),
      carbohydrates: carbGrams,
      fat: fatGrams,
      protein: proteinGrams,
    },
    micros: micros
  };
};
