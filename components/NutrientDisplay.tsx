import React from 'react';
import { Product, UserProfile, ProductAnalysis } from '../types';
import Card from './common/Card';

interface NutrientDisplayProps {
  product: Product;
  userProfile: UserProfile;
  productAnalysis: ProductAnalysis | null;
}

const NutrientDisplay: React.FC<NutrientDisplayProps> = ({ product, userProfile, productAnalysis }) => {
  const { product_name, image_front_url, nutriments, nutriscore_grade, ingredients_text, serving_size } = product;

  const getNutriscoreColor = (grade?: string) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'bg-green-500';
      case 'b': return 'bg-lime-500';
      case 'c': return 'bg-yellow-500';
      case 'd': return 'bg-orange-500';
      case 'e': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const NutrientRow: React.FC<{ label: string; value: number | undefined; unit: string }> = ({ label, value, unit }) => {
      if (value === undefined || isNaN(value)) return null;
      return (
          <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{label}</span>
              <span className="font-semibold text-gray-800">{value.toFixed(2)} {unit}</span>
          </div>
      );
  }

  const renderIngredients = () => {
    if (!ingredients_text) return <p className="text-sm text-gray-500">No ingredients listed.</p>;

    const userAllergies = userProfile.allergies.toLowerCase().split(',').map(a => a.trim()).filter(Boolean);
    
    // Simple word boundary regex for each allergen
    const allergyRegex = userAllergies.length > 0 ? new RegExp(`\\b(${userAllergies.join('|')})\\b`, 'gi') : null;

    let highlightedText = ingredients_text;

    if(allergyRegex) {
        highlightedText = highlightedText.replace(allergyRegex, (match) => `<span class="bg-red-200 text-red-800 font-bold px-1 rounded">${match}</span>`);
    }

    // Highlighting for health conditions
    if(userProfile.isDiabetic) {
        highlightedText = highlightedText.replace(/\b(sugar|syrup|glucose|fructose)\b/gi, (match) => `<span class="bg-yellow-200 text-yellow-800 font-bold px-1 rounded">${match}</span>`);
    }
    if(userProfile.hasHighBP) {
        highlightedText = highlightedText.replace(/\b(salt|sodium)\b/gi, (match) => `<span class="bg-yellow-200 text-yellow-800 font-bold px-1 rounded">${match}</span>`);
    }

    return <p className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  }

  return (
    <Card className="max-w-md mx-auto mt-6">
        {product_name && <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{product_name}</h2>}
        
        {productAnalysis && (productAnalysis.warnings.length > 0 || (productAnalysis.alternativeSuggestions && productAnalysis.alternativeSuggestions.length > 0)) && (
            <Card className="mb-6 bg-amber-50 border-amber-400">
                <h3 className="text-lg font-bold text-amber-800 mb-3">Personalized Advice</h3>
                {productAnalysis.warnings.map((warning, index) => (
                    <div key={index} className="mb-3">
                        <p className="font-semibold text-red-700">⚠️ {warning.type === 'allergen' ? 'Allergen Alert' : 'Health Warning'}: Contains {warning.triggerIngredient}</p>
                        <p className="text-sm text-gray-700 mt-1">{warning.message}</p>
                    </div>
                ))}
                {productAnalysis.alternativeSuggestions && productAnalysis.alternativeSuggestions.length > 0 && (
                     <div>
                        <p className="font-semibold text-emerald-700 mb-2">💡 Alternative Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                           {productAnalysis.alternativeSuggestions.map((suggestion, index) => (
                              <span key={index} className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
                                {suggestion}
                              </span>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        )}
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {image_front_url && (
                <div className="flex-shrink-0 w-full md:w-1/3">
                    <img src={image_front_url} alt={product_name} className="rounded-lg shadow-sm w-full" />
                </div>
            )}
            
            <div className="flex-grow w-full md:w-2/3">
                {nutriscore_grade && (
                    <div className="flex items-center gap-3 mb-4">
                        <span className="font-semibold">Nutri-Score:</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${getNutriscoreColor(nutriscore_grade)}`}>
                            {nutriscore_grade.toUpperCase()}
                        </div>
                    </div>
                )}

                {serving_size && <p className="text-sm text-gray-500 mb-3">Serving size: {serving_size}</p>}
                
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nutrition Facts (per 100g)</h3>
                <div className="text-sm">
                    <NutrientRow label="Calories" value={nutriments?.['energy-kcal_100g']} unit="kcal" />
                    <NutrientRow label="Fat" value={nutriments?.['fat_100g']} unit="g" />
                    <NutrientRow label="Saturated Fat" value={nutriments?.['saturated-fat_100g']} unit="g" />
                    <NutrientRow label="Carbohydrates" value={nutriments?.['carbohydrates_100g']} unit="g" />
                    <NutrientRow label="Sugars" value={nutriments?.['sugars_100g']} unit="g" />
                    <NutrientRow label="Fiber" value={nutriments?.['fiber_100g']} unit="g" />
                    <NutrientRow label="Protein" value={nutriments?.['proteins_100g']} unit="g" />
                    <NutrientRow label="Salt" value={nutriments?.['salt_100g']} unit="g" />
                </div>
            </div>
        </div>

        <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Ingredients</h3>
            {renderIngredients()}
        </div>
    </Card>
  );
};

export default NutrientDisplay;
