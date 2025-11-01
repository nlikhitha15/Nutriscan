
import { OpenFoodFactsResponse } from '../types';

const API_URL = 'https://world.openfoodfacts.org/api/v2/product/';

export const getProductByBarcode = async (barcode: string): Promise<OpenFoodFactsResponse> => {
  if (!barcode) {
    throw new Error('Barcode cannot be empty.');
  }
  
  // FIX: Use fields parameter to make API call more efficient.
  const response = await fetch(`${API_URL}${barcode}.json?fields=product_name,image_front_url,nutriments,nutriscore_grade,serving_size,ingredients_text,allergens_from_ingredients`);

  if (!response.ok) {
    throw new Error('Network response was not ok.');
  }

  const data: OpenFoodFactsResponse = await response.json();
  return data;
};
