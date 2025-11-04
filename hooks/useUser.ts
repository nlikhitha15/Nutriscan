import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { calculateDefaultGoals } from '../utils/nutritionCalculations';

const USER_LOGGED_IN_KEY = 'nutriscan_isLoggedIn';
const USER_PROFILE_KEY = 'nutriscan_userProfile';

export const useUser = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedIsLoggedIn = localStorage.getItem(USER_LOGGED_IN_KEY);
      const storedUserProfile = localStorage.getItem(USER_PROFILE_KEY);

      if (storedIsLoggedIn === 'true') {
        setIsLoggedIn(true);
        if (storedUserProfile) {
          setUserProfile(JSON.parse(storedUserProfile));
        }
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    localStorage.setItem(USER_LOGGED_IN_KEY, 'true');
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_LOGGED_IN_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    setIsLoggedIn(false);
    setUserProfile(null);
  }, []);

  const saveProfile = useCallback((profile: UserProfile) => {
    // If nutritionGoals don't exist, it's the first time setup from onboarding.
    if (!profile.nutritionGoals) {
      const goals = calculateDefaultGoals(profile);
      profile.nutritionGoals = goals;
    }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    setUserProfile(profile);
  }, []);

  return {
    isLoggedIn,
    userProfile,
    login,
    logout,
    saveProfile,
    loading,
  };
};