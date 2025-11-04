import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UserProfile, MealAnalysis, Product, ProductAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- MEAL ANALYSIS (PHOTO) ---

const generateMealPrompt = (userProfile: UserProfile): string => {
  let prompt = `As an expert nutritionist, analyze the following meal image for a user with these characteristics:
- Gender: ${userProfile.gender}
- Age: ${userProfile.age}
- Fitness Goal: ${userProfile.fitnessGoal.replace('_', ' ')}
- Activity Level: ${userProfile.activityLevel.replace('_', ' ')}
- Diet Preference: ${userProfile.dietPreference}
`;

  const conditions = [];
  if (userProfile.isDiabetic) conditions.push("Diabetes");
  if (userProfile.hasHighBP) conditions.push("High Blood Pressure");
  if (userProfile.hasHighCholesterol) conditions.push("High Cholesterol");
  if (userProfile.hasPCOS) conditions.push("PCOS");
  if (userProfile.hasThyroidIssues) conditions.push("Thyroid Issues");
  if (userProfile.isPregnant) conditions.push("Pregnancy");
  if (userProfile.isBreastfeeding) conditions.push("Breastfeeding");


  if (conditions.length > 0) {
    prompt += `- Health Conditions: ${conditions.join(', ')}\n`;
  }
  if (userProfile.allergies) {
    prompt += `- Allergies: ${userProfile.allergies}\n`;
  }

  prompt += `
INSTRUCTIONS FOR ACCURATE PORTION ESTIMATION:
- **Look for Common Objects:** The user might place a common object (like a coin, credit card, or their hand) in the photo for scale. If you see one, use it to refine your portion estimates.

Analyze the meal in the image and provide a detailed breakdown.
1.  **Identify Components & Portions:** Identify the main dishes/components on the plate (e.g., 'Rice', 'Lentil Curry', 'Steamed Vegetables'). For each component, provide:
    a. A descriptive name.
    b. An estimated weight in grams (as a number).
2.  **Estimate Meal Totals:** Based on your estimated weights, calculate and provide the estimated TOTAL calories and macronutrients (protein, carbs, fat) in grams for the entire meal.
3.  **Estimate Micronutrients:** Estimate key micronutrients for the TOTAL meal: Saturated Fat (g), Cholesterol (mg), Sodium (mg), Potassium (mg), Fiber (g), and Sugar (g).
4.  **Provide Analysis:** Give a general health analysis, portion advice, personalized warnings, and healthier alternative suggestions.
    - **CRITICAL RULE FOR WARNINGS:**
    - Only generate an 'allergen' type warning if you identify an ingredient that directly matches one of the user's listed allergies.
    - Only generate a 'health_condition' type warning if a food item or the overall meal composition conflicts with the user's specified health conditions.
    - Do NOT issue generic warnings for common allergens that are not on the user's list.
5.  **Recommendation:** Provide a boolean 'isRecommended' field based on the user's profile.

Return the analysis strictly in the specified JSON format.
`;
  return prompt;
};

const mealAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        mealName: { type: Type.STRING, description: "A descriptive name for the meal." },
        estimatedCalories: { type: Type.NUMBER, description: "The estimated total calorie count for the entire meal." },
        macros: {
            type: Type.OBJECT,
            description: "The estimated total macronutrients for the entire meal.",
            properties: {
                protein: { type: Type.NUMBER },
                carbohydrates: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
            },
            required: ["protein", "carbohydrates", "fat"]
        },
        micronutrients: {
            type: Type.OBJECT,
            properties: {
                saturatedFat: { type: Type.NUMBER, description: "in grams" },
                cholesterol: { type: Type.NUMBER, description: "in mg" },
                sodium: { type: Type.NUMBER, description: "in mg" },
                potassium: { type: Type.NUMBER, description: "in mg" },
                fiber: { type: Type.NUMBER, description: "in grams" },
                sugar: { type: Type.NUMBER, description: "in grams" },
            },
        },
        ingredients: {
            type: Type.ARRAY,
            description: "A list of identified main dishes/components with their estimated weights.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the main dish/component." },
                    estimatedWeightGrams: { type: Type.NUMBER, description: "The estimated weight in grams." },
                },
                required: ["name", "estimatedWeightGrams"]
            }
        },
        healthAnalysis: { type: Type.STRING, description: "General health analysis of the meal." },
        portionAdvice: { type: Type.STRING, description: "Advice on portion control." },
        isRecommended: { type: Type.BOOLEAN },
        personalizedWarnings: {
            type: Type.ARRAY,
            description: "A list of warnings specific to the user's profile.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Can be 'allergen' or 'health_condition'." },
                    trigger: { type: Type.STRING, description: "The ingredient or reason for the warning (e.g., 'Peanuts', 'High Sugar')." },
                    message: { type: Type.STRING, description: "A personalized warning message for the user." }
                },
                required: ["type", "trigger", "message"]
            }
        },
        alternativeSuggestions: { 
            type: Type.ARRAY,
            description: "A list of actionable suggestions for healthier alternatives.",
            items: { type: Type.STRING }
        }
    },
    required: ["mealName", "estimatedCalories", "macros", "micronutrients", "ingredients", "healthAnalysis", "portionAdvice", "isRecommended", "personalizedWarnings", "alternativeSuggestions"]
};

export const analyzeMealWithGemini = async (
  base64Image: string,
  userProfile: UserProfile
): Promise<MealAnalysis> => {
  const imagePart = { inlineData: { mimeType: "image/jpeg", data: base64Image } };
  const textPart = { text: generateMealPrompt(userProfile) };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: mealAnalysisSchema,
        temperature: 0.2
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing meal with Gemini:", error);
    throw new Error("Failed to get meal analysis from AI. Please try again.");
  }
};


// --- PRODUCT ANALYSIS (BARCODE) ---

const generateProductPrompt = (product: Product, userProfile: UserProfile): string => {
  const conditions = [];
  if (userProfile.isDiabetic) conditions.push("Diabetes");
  if (userProfile.hasHighBP) conditions.push("High Blood Pressure");
  if (userProfile.hasHighCholesterol) conditions.push("High Cholesterol");
  if (userProfile.hasPCOS) conditions.push("PCOS");
  if (userProfile.hasThyroidIssues) conditions.push("Thyroid Issues");
  if (userProfile.isPregnant) conditions.push("Pregnancy");
  if (userProfile.isBreastfeeding) conditions.push("Breastfeeding");

  return `You are an expert nutritionist providing personalized advice. A user with the following profile has scanned a product.

User Profile:
- Health Conditions: ${conditions.join(', ') || 'None'}
- Allergies: ${userProfile.allergies || 'None listed'}

Product Name: ${product.product_name || 'N/A'}
Ingredients: ${product.ingredients_text || 'None listed'}

Your Task:
1.  **Analyze Ingredients:** Carefully review the ingredients list.
2.  **Generate Warnings:**
    - **CRITICAL RULE:** Only generate warnings based *directly* on the user's profile.
    - For **Allergies**: Only create an 'allergen' warning if an ingredient explicitly matches one of the user's listed allergies (User's Allergies: ${userProfile.allergies || 'None listed'}). Do NOT warn about common allergens if they are not on the user's list.
    - For **Health Conditions**: Only create a 'health_condition' warning if an ingredient or the product's nutritional profile conflicts with the user's listed conditions (User's Health Conditions: ${conditions.join(', ') || 'None'}).
    - The warning message must clearly explain *why* it is a concern for this specific user.
3.  **Suggest Alternatives:** Provide a list of actionable and healthier alternative product suggestions that the user could look for instead. Be specific and concise (e.g., "Coconut milk yogurt", "Bread with less than 2g of sugar per slice").

Return the analysis strictly in the specified JSON format. If there are no warnings, return an empty "warnings" array. If no alternatives are relevant, return an empty "alternativeSuggestions" array.
`;
}

const productAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        warnings: {
            type: Type.ARRAY,
            description: "A list of personalized warnings based on the user's profile and product ingredients.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Can be 'allergen' or 'health_condition'." },
                    triggerIngredient: { type: Type.STRING, description: "The ingredient that triggered the warning." },
                    message: { type: Type.STRING, description: "A detailed explanation for the user about the risk." }
                },
                required: ["type", "triggerIngredient", "message"]
            }
        },
        alternativeSuggestions: {
            type: Type.ARRAY,
            description: "A list of actionable suggestions for healthier alternative products or ingredients.",
            items: { type: Type.STRING }
        }
    },
    required: ["warnings", "alternativeSuggestions"]
};

export const analyzeProductWithGemini = async (product: Product, userProfile: UserProfile): Promise<ProductAnalysis> => {
    try {
        // FIX: Simplified `contents` for a text-only request per Gemini API guidelines.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Flash is sufficient for this text-based task
            contents: generateProductPrompt(product, userProfile),
            config: {
                responseMimeType: "application/json",
                responseSchema: productAnalysisSchema,
                temperature: 0.3
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing product with Gemini:", error);
        throw new Error("Failed to get personalized advice from AI.");
    }
}