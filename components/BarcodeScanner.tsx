import React, { useState } from 'react';
import { getProductByBarcode } from '../services/openFoodFactsApi';
import { analyzeProductWithGemini } from '../services/geminiService';
import { OpenFoodFactsResponse, ProductAnalysis, UserProfile } from '../types';
import NutrientDisplay from './NutrientDisplay';
import Spinner from './common/Spinner';
import Card from './common/Card';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { ScanIcon } from './icons/ScanIcon';

interface BarcodeScannerProps {
  userProfile: UserProfile;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ userProfile }) => {
  const [barcode, setBarcode] = useState<string>('');
  const [productInfo, setProductInfo] = useState<OpenFoodFactsResponse | null>(null);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) {
      setError('Please enter a barcode.');
      return;
    }
    
    setIsLoading(true);
    setIsAnalyzing(false);
    setError(null);
    setProductInfo(null);
    setProductAnalysis(null);

    try {
      const data = await getProductByBarcode(barcode);
      if (data.status === 0 || !data.product) {
        throw new Error(data.status_verbose || 'Product not found.');
      }
      setProductInfo(data);
      
      // Trigger personalized analysis after fetching product info
      if (data.product.ingredients_text) {
        setIsAnalyzing(true);
        const analysis = await analyzeProductWithGemini(data.product, userProfile);
        setProductAnalysis(analysis);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch product data.');
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Barcode Scanner</h2>
          <p className="mt-2 text-gray-600">Enter a barcode to get personalized nutritional insights.</p>
        </div>
        <form onSubmit={handleScan} className="mt-6 max-w-sm mx-auto">
          <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-700">
            Enter Barcode
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
              <BarcodeIcon />
            </span>
            <input
              type="text"
              id="barcode-input"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g., 3017620422003"
              className="flex-1 block w-full rounded-none px-3 py-2 border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
             <button
              type="submit"
              disabled={isLoading || isAnalyzing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300"
            >
              <ScanIcon />
            </button>
          </div>
        </form>
      </Card>
      
      {isLoading && <Spinner />}
      
      {isAnalyzing && (
        <Card>
            <div className="flex items-center justify-center gap-4">
                <Spinner />
                <p className="text-gray-600">Generating personalized advice...</p>
            </div>
        </Card>
      )}

      {error && <Card className="bg-red-50 border-red-500 border"><p className="text-red-700 text-center">{error}</p></Card>}
      
      {productInfo?.product && (
        <NutrientDisplay 
            product={productInfo.product} 
            userProfile={userProfile}
            productAnalysis={productAnalysis}
        />
      )}
    </div>
  );
};

export default BarcodeScanner;