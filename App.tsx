import React from 'react';
import { useUser } from './hooks/useUser';
import LoginScreen from './components/auth/LoginScreen';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import MainApp from './components/MainApp';
import Spinner from './components/common/Spinner';
import { UserProfile } from './types';

const App: React.FC = () => {
  const { isLoggedIn, userProfile, login, logout, saveProfile, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  const handleProfileComplete = (profile: UserProfile) => {
    saveProfile(profile);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} />;
  }

  if (!userProfile) {
    return <OnboardingFlow onProfileComplete={handleProfileComplete} />;
  }

  return <MainApp userProfile={userProfile} onLogout={logout} />;
};

export default App;
