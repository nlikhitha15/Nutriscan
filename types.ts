export interface MacroGoals {
  calories: number;
  carbohydrates: number; // in grams
  fat: number; // in grams
  protein: number; // in grams
}

export interface MicroGoals {
  saturatedFat: number; // g
  polyunsaturatedFat: number; // g
  monounsaturatedFat: number; // g
  transFat: number; // g
  cholesterol: number; // mg
  sodium: number; // mg
  potassium: number; // mg
  fiber: number; // g
  sugar: number; // g
  vitaminA: number; // mcg RAE
  vitaminC: number; // mg
  calcium: number; // mg
  iron: number; // mg
}

export interface NutritionGoals {
  macros: MacroGoals;
  micros: MicroGoals;
}

export interface LoggedNutrients {
  macros: Partial<MacroGoals>;
  micros: Partial<MicroGoals>;
}


export interface UserProfile {
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  isDiabetic: boolean;
  hasHighBP: boolean;
  hasHighCholesterol: boolean;
  hasPCOS: boolean;
  hasThyroidIssues: boolean;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  dietPreference: 'none' | 'vegetarian' | 'non-vegetarian' | 'vegan';
  fitnessGoal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
  allergies: string;
  nutritionGoals?: NutritionGoals;
}

export interface Nutriments {
  'energy-kcal_100g'?: number;
  'fat_100g'?: number;
  'saturated-fat_100g'?: number;
  'polyunsaturated-fat_100g'?: number;
  'monounsaturated-fat_100g'?: number;
  'trans-fat_100g'?: number;
  'cholesterol_100g'?: number;
  'carbohydrates_100g'?: number;
  'sugars_100g'?: number;
  'fiber_100g'?: number;
  'proteins_100g'?: number;
  'salt_100g'?: number;
  'sodium_100g'?: number;
  'potassium_100g'?: number;
}

export interface Product {
  product_name?: string;
  image_front_url?: string;
  nutriments?: Nutriments;
  nutriscore_grade?: string;
  serving_size?: string;
  ingredients_text?: string;
  allergens_from_ingredients?: string;
}

export interface OpenFoodFactsResponse {
  code: string;
  status: number;
  product: Product;
  status_verbose: string;
}

export interface MealAnalysis {
  mealName: string;
  estimatedCalories: number;
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  micronutrients: {
    saturatedFat?: number;
    cholesterol?: number;
    sodium?: number;
    fiber?: number;
    sugar?: number;
    potassium?: number;
  };
  ingredients: Array<{
    name: string;
    estimatedWeightGrams: number;
  }>;
  healthAnalysis: string;
  portionAdvice: string;
  isRecommended: boolean;
  personalizedWarnings: Array<{
      type: 'allergen' | 'health_condition';
      trigger: string;
      message: string;
  }>;
  alternativeSuggestions: string[];
}

export interface ProductAnalysis {
  warnings: Array<{
    type: 'allergen' | 'health_condition';
    triggerIngredient: string;
    message: string;
  }>;
  alternativeSuggestions: string[];
}
