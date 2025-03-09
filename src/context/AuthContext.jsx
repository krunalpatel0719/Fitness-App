"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { auth } from "../lib/firebase";
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  updateProfile as firebaseUpdateProfile 
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [profileUpdated, setProfileUpdated] = useState(0);

  const updateUserProfile = async (profileData) => {
    if (!currentUser) {
      throw new Error("No user is signed in");
    }
    
    try {
      // Update Firebase profile
      await firebaseUpdateProfile(auth.currentUser, profileData);
     
      setUserProfile(prev => ({
        ...prev,
        ...profileData
      }));
      
      // Force UI updates
      setProfileUpdated(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          
          setUserProfile({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
          });

          // Provider checks
          const isEmail = user.providerData.some(
            (provider) => provider.providerId === "password"
          );
          setIsEmailUser(isEmail);

          const isGoogle = user.providerData.some(
            (provider) =>
              provider.providerId === GoogleAuthProvider.PROVIDER_ID
          );
          setIsGoogleUser(isGoogle);

          setUserLoggedIn(true);
        } else {
          setCurrentUser(null);
          setUserProfile({});
          setUserLoggedIn(false);
        }
      } catch (err) {
        console.error("Error initializing user:", err);
        setError(err);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      userLoggedIn,
      isEmailUser,
      isGoogleUser,
      error,
      updateUserProfile,
    }),
    [currentUser, userProfile, userLoggedIn, isEmailUser, isGoogleUser, error, profileUpdated]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}