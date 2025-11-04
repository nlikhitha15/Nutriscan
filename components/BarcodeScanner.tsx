import React, { useState, useEffect, useRef } from 'react';
import { getProductByBarcode } from '../services/openFoodFactsApi';
import { analyzeProductWithGemini } from '../services/geminiService';
import { OpenFoodFactsResponse, ProductAnalysis, UserProfile, LoggedNutrients } from '../types';
import NutrientDisplay from './NutrientDisplay';
import Spinner from './common/Spinner';
import Card from './common/Card';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { ScanIcon } from './icons/ScanIcon';
import { CameraIcon } from './icons/CameraIcon';

// This declaration is necessary because html5-qrcode is loaded from a script tag in index.html
declare const Html5Qrcode: any;

interface BarcodeScannerProps {
  userProfile: UserProfile;
  onLogProduct: (nutrients: LoggedNutrients) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ userProfile, onLogProduct }) => {
  const [barcode, setBarcode] = useState<string>('');
  const [productInfo, setProductInfo] = useState<OpenFoodFactsResponse | null>(null);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  const scannerRef = useRef<any>(null);

  const fetchProductData = async (barcodeToFetch: string) => {
    if (!barcodeToFetch) {
      setError('Please enter or scan a barcode.');
      return;
    }
    
    setIsLoading(true);
    setIsAnalyzing(false);
    setError(null);
    setProductInfo(null);
    setProductAnalysis(null);

    try {
      const data = await getProductByBarcode(barcodeToFetch);
      if (data.status === 0 || !data.product) {
        throw new Error(data.status_verbose || 'Product not found.');
      }
      setProductInfo(data);
      
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProductData(barcode);
  };
  
  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    setBarcode(decodedText);
    stopScanner();
    fetchProductData(decodedText);
  };

  const onScanFailure = (errorMessage: string) => {
    // This function is called frequently, so we typically ignore errors unless needed for debugging.
  };

  const startScanner = () => {
    setError(null);
    setIsScanning(true);
    const html5QrcodeScanner = new Html5Qrcode("reader");
    scannerRef.current = html5QrcodeScanner;
    html5QrcodeScanner.start(
      { facingMode: "environment" }, // Use the rear camera
      {
        fps: 10,
        qrbox: { width: 250, height: 150 }
      },
      onScanSuccess,
      onScanFailure
    ).catch((err: any) => {
      console.error("Failed to start scanner", err);
      setError("Could not start camera. Please check permissions and try again.");
      setIsScanning(false);
    });
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch((err: any) => {
          console.error("Failed to stop scanner", err);
          setIsScanning(false);
        });
    } else {
        setIsScanning(false);
    }
  };

  // Cleanup effect to stop the scanner when the component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);


  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        {isScanning ? (
           <div className="text-center">
             <h2 className="text-2xl font-bold text-gray-800">Scan Product Barcode</h2>
             <div id="reader" className="mt-4 w-full aspect-video max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100"></div>
             <p className="text-xs text-gray-500 mt-2">Place the barcode inside the box</p>
             <button
                 onClick={stopScanner}
                 className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
             >
                 Cancel
             </button>
           </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Barcode Scanner</h2>
              <p className="mt-2 text-gray-600">Enter a barcode or use your camera to scan.</p>
            </div>
            <form onSubmit={handleFormSubmit} className="mt-6 max-w-sm mx-auto">
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
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500 mb-3">OR</p>
                 <button
                    onClick={startScanner}
                    disabled={isLoading || isAnalyzing}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300"
                    >
                    <CameraIcon />
                    <span>Scan with Camera</span>
                </button>
            </div>
          </>
        )}
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

      {error && !isScanning && <Card className="bg-red-50 border-red-500 border"><p className="text-red-700 text-center">{error}</p></Card>}
      
      {productInfo?.product && (
        <NutrientDisplay 
            key={productInfo.code}
            product={productInfo.product} 
            userProfile={userProfile}
            productAnalysis={productAnalysis}
            onLogProduct={onLogProduct}
        />
      )}
    </div>
  );
};

export default BarcodeScanner;
