export interface UserProfile {
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  isDiabetic: boolean;
  hasHighBP: boolean;
  dietPreference: 'none' | 'vegetarian' | 'non-vegetarian' | 'vegan';
  fitnessGoal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
  allergies: string;
}

export interface Nutriments {
  'energy-kcal_100g'?: number;
  'fat_100g'?: number;
  'saturated-fat_100g'?: number;
  'carbohydrates_100g'?: number;
  'sugars_100g'?: number;
  'fiber_100g'?: number;
  'proteins_100g'?: number;
  'salt_100g'?: number;
  'sodium_100g'?: number;
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
  ingredients: Array<{
    name: string;
    estimatedAmount: string;
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