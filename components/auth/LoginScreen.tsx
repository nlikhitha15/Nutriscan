import React from 'react';
import { GoogleIcon } from '../icons/GoogleIcon';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-emerald-600">Welcome to Nutri-Vision AI</h1>
        <p className="mt-2 text-lg text-gray-600">Your personal nutrition assistant.</p>
        <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
          <p className="mt-2 text-gray-500">Please sign in to continue.</p>
          <div className="mt-6">
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              <GoogleIcon className="w-6 h-6" />
              <span>Login with Google</span>
            </button>
            <p className="mt-4 text-xs text-gray-400">(This is a simulated login for demonstration)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
