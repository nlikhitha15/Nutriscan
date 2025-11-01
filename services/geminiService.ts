import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UserProfile, MealAnalysis, Product, ProductAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- MEAL ANALYSIS (PHOTO) ---

const generateMealPrompt = (userProfile: UserProfile): string => {
  let prompt = `As an expert nutritionist, analyze the following meal image for a user with these characteristics:
- Gender: ${userProfile.gender}
- Age: ${userProfile.age}
- Fitness Goal: ${userProfile.fitnessGoal.replace('_', ' ')}
- Diet Preference: ${userProfile.dietPreference}
`;

  const conditions = [];
  if (userProfile.isDiabetic) conditions.push("Diabetic");
  if (userProfile.hasHighBP) conditions.push("High Blood Pressure");
  if (conditions.length > 0) {
    prompt += `- Health Conditions: ${conditions.join(', ')}\n`;
  }
  if (userProfile.allergies) {
    prompt += `- Allergies: ${userProfile.allergies}\n`;
  }

  prompt += `
Analyze the meal in the image and provide a detailed breakdown. 
1. Identify the main dishes/components on the plate (e.g., 'Rice', 'Lentil Curry', 'Steamed Vegetables'). Provide an estimated weight in grams for each main component. Do not break down a single dish into its raw ingredients (e.g., don't list onion, tomato, spices for the curry separately).
2. Estimate total calories and macronutrients (protein, carbs, fat) in grams for the entire meal.
3. Provide a general health analysis and portion advice.
4. Create a list of personalized warnings. If any ingredients conflict with the user's allergies or are particularly bad for their health conditions, list them here with a short, clear message.
5. Provide a list of alternative suggestions. For instance, if the meal is unhealthy, suggest a healthier alternative meal. If a specific ingredient is problematic, suggest a substitute. Keep each suggestion concise and actionable.
6. Give a boolean 'isRecommended' field based on whether this meal aligns well with the user's profile.

Return the analysis strictly in the specified JSON format.
`;
  return prompt;
};

const mealAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        mealName: { type: Type.STRING, description: "A descriptive name for the meal." },
        estimatedCalories: { type: Type.NUMBER, description: "The estimated total calorie count." },
        macros: {
            type: Type.OBJECT,
            properties: {
                protein: { type: Type.NUMBER },
                carbohydrates: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
            },
            required: ["protein", "carbohydrates", "fat"]
        },
        ingredients: {
            type: Type.ARRAY,
            description: "A list of identified main dishes/components with their estimated amounts.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the main dish/component." },
                    estimatedAmount: { type: Type.STRING, description: "The estimated weight (e.g., '150g')." }
                },
                required: ["name", "estimatedAmount"]
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
    required: ["mealName", "estimatedCalories", "macros", "ingredients", "healthAnalysis", "portionAdvice", "isRecommended", "personalizedWarnings", "alternativeSuggestions"]
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
  if (userProfile.isDiabetic) conditions.push("Diabetic");
  if (userProfile.hasHighBP) conditions.push("High Blood Pressure");

  return `You are an expert nutritionist providing personalized advice. A user with the following profile has scanned a product.

User Profile:
- Health Conditions: ${conditions.join(', ') || 'None'}
- Allergies: ${userProfile.allergies || 'None listed'}

Product Name: ${product.product_name || 'N/A'}
Ingredients: ${product.ingredients_text || 'None listed'}

Your Task:
1.  **Analyze Ingredients:** Carefully review the ingredients list based on the user's specific health conditions and allergies.
2.  **Generate Warnings:** If you find any conflicting ingredients (e.g., milk for a milk allergy, high sugar for a diabetic), create a warning. The message should clearly explain *why* it is a concern for this specific user.
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