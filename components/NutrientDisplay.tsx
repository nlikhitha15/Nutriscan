import React, { useState } from 'react';
import { Product, UserProfile, ProductAnalysis, LoggedNutrients } from '../types';
import Card from './common/Card';

interface NutrientDisplayProps {
  product: Product;
  userProfile: UserProfile;
  productAnalysis: ProductAnalysis | null;
  onLogProduct: (nutrients: LoggedNutrients) => void;
}

const NutrientDisplay: React.FC<NutrientDisplayProps> = ({ product, userProfile, productAnalysis, onLogProduct }) => {
  const { product_name, image_front_url, nutriments, nutriscore_grade, ingredients_text, serving_size } = product;
  const [servings, setServings] = useState(1);
  const [isLogged, setIsLogged] = useState(false);
  
  const allWarnings = productAnalysis?.warnings || [];
  const allergenWarnings = allWarnings.filter(w => w.type === 'allergen');
  const healthWarnings = allWarnings.filter(w => w.type === 'health_condition');

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
  
  const handleLogProduct = () => {
    if (!nutriments || servings <= 0) return;

    const servingGrams = parseFloat(serving_size || '100');
    if (isNaN(servingGrams)) return;
    
    const multiplier = (servingGrams * servings) / 100.0;

    const loggedNutrients: LoggedNutrients = {
        macros: {
            calories: (nutriments['energy-kcal_100g'] || 0) * multiplier,
            protein: (nutriments['proteins_100g'] || 0) * multiplier,
            carbohydrates: (nutriments['carbohydrates_100g'] || 0) * multiplier,
            fat: (nutriments['fat_100g'] || 0) * multiplier,
        },
        micros: {
            saturatedFat: (nutriments['saturated-fat_100g'] || 0) * multiplier,
            polyunsaturatedFat: (nutriments['polyunsaturated-fat_100g'] || 0) * multiplier,
            monounsaturatedFat: (nutriments['monounsaturated-fat_100g'] || 0) * multiplier,
            transFat: (nutriments['trans-fat_100g'] || 0) * multiplier,
            cholesterol: (nutriments['cholesterol_100g'] || 0) * 1000 * multiplier,
            sodium: (nutriments['sodium_100g'] || 0) * 1000 * multiplier,
            potassium: (nutriments['potassium_100g'] || 0) * 1000 * multiplier,
            fiber: (nutriments['fiber_100g'] || 0) * multiplier,
            sugar: (nutriments['sugars_100g'] || 0) * multiplier,
        }
    };
    onLogProduct(loggedNutrients);
    setIsLogged(true);
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

    // Step 1: Simplify complex biological/chemical names into more common terms.
    const simplificationMap: { [key: string]: string } = {
        'high-fructose corn syrup': 'Sugar (from Corn)',
        'fructose': 'Sugar (from Fruit)',
        'sucrose': 'Table Sugar',
        'glucose': 'Sugar',
        'dextrose': 'Sugar',
        'maltodextrin': 'Thickener (from Starch)',
        'sodium chloride': 'Salt',
        'ascorbic acid': 'Vitamin C',
        'tocopherols': 'Vitamin E',
        'monosodium glutamate': 'MSG (Flavor Enhancer)',
    };

    let highlightedText = ingredients_text;

    for (const [complex, simple] of Object.entries(simplificationMap)) {
        // Use a case-insensitive regex with word boundaries to replace terms
        const regex = new RegExp(`\\b${complex.replace('-', '\\-')}\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, simple);
    }
    
    // Step 2: Highlight ingredients that match the user's specific allergies in light red.
    const userAllergies = userProfile.allergies.toLowerCase().split(',').map(a => a.trim()).filter(Boolean);
    const allergyRegex = userAllergies.length > 0 ? new RegExp(`\\b(${userAllergies.join('|')})\\b`, 'gi') : null;

    if(allergyRegex) {
        highlightedText = highlightedText.replace(allergyRegex, (match) => `<span class="bg-red-200 text-red-800 font-bold px-1 rounded">${match}</span>`);
    }

    return <p className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  }

  return (
    <Card className="max-w-md mx-auto mt-6">
        {product_name && <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{product_name}</h2>}
        
        {productAnalysis && (allWarnings.length > 0 || (productAnalysis.alternativeSuggestions && productAnalysis.alternativeSuggestions.length > 0)) && (
            <Card className="mb-6 bg-amber-50 border-amber-400">
                <h3 className="text-lg font-bold text-amber-800 mb-3">Personalized Advice</h3>
                
                {allergenWarnings.length > 0 && allergenWarnings.map((warning, index) => (
                    <div key={`allergen-${index}`} className="mb-3">
                        <p className="font-semibold text-red-700">⚠️ Allergen Alert: Contains {warning.triggerIngredient}</p>
                        <p className="text-sm text-gray-700 mt-1">{warning.message}</p>
                    </div>
                ))}

                {healthWarnings.length > 0 && healthWarnings.map((warning, index) => (
                    <div key={`health-${index}`} className="mb-3">
                        <p className="font-semibold text-orange-700">️Health Advisory: Contains {warning.triggerIngredient}</p>
                        <p className="text-sm text-gray-700 mt-1">{warning.message}</p>
                    </div>
                ))}

                {productAnalysis.alternativeSuggestions && productAnalysis.alternativeSuggestions.length > 0 && (
                     <div className={(allWarnings.length > 0) ? "mt-4" : ""}>
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
                    <NutrientRow label="Polyunsaturated Fat" value={nutriments?.['polyunsaturated-fat_100g']} unit="g" />
                    <NutrientRow label="Monounsaturated Fat" value={nutriments?.['monounsaturated-fat_100g']} unit="g" />
                    <NutrientRow label="Trans Fat" value={nutriments?.['trans-fat_100g']} unit="g" />
                    <NutrientRow label="Carbohydrates" value={nutriments?.['carbohydrates_100g']} unit="g" />
                    <NutrientRow label="Sugars" value={nutriments?.['sugars_100g']} unit="g" />
                    <NutrientRow label="Fiber" value={nutriments?.['fiber_100g']} unit="g" />
                    <NutrientRow label="Protein" value={nutriments?.['proteins_100g']} unit="g" />
                    <NutrientRow label="Cholesterol" value={nutriments?.['cholesterol_100g'] !== undefined ? nutriments['cholesterol_100g'] * 1000 : undefined} unit="mg" />
                    <NutrientRow label="Sodium" value={nutriments?.['sodium_100g'] !== undefined ? nutriments['sodium_100g'] * 1000 : undefined} unit="mg" />
                    <NutrientRow label="Potassium" value={nutriments?.['potassium_100g'] !== undefined ? nutriments['potassium_100g'] * 1000 : undefined} unit="mg" />
                    <NutrientRow label="Salt" value={nutriments?.['salt_100g']} unit="g" />
                </div>
            </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">Log this Product</h3>
            <div className="mt-2 flex items-center gap-4">
                <div className="flex-grow">
                    <label htmlFor="servings" className="block text-sm font-medium text-gray-600">Servings</label>
                    <input 
                        type="number"
                        id="servings"
                        value={servings}
                        onChange={(e) => setServings(Math.max(0, parseFloat(e.target.value)))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        step="0.1"
                    />
                </div>
                <button
                    onClick={handleLogProduct}
                    disabled={isLogged}
                    className="self-end px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed"
                >
                    {isLogged ? 'Logged ✔' : 'Log'}
                </button>
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