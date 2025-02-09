// src/context/AuthContext.jsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);

          // Check if the user signed in using email/password
          const isEmail = user.providerData.some(
            (provider) => provider.providerId === "password"
          );
          setIsEmailUser(isEmail);

          // Check if the user signed in with Google
          const isGoogle = user.providerData.some(
            (provider) =>
              provider.providerId === GoogleAuthProvider.PROVIDER_ID
          );
          setIsGoogleUser(isGoogle);

          setUserLoggedIn(true);
        } else {
          setCurrentUser(null);
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
      userLoggedIn,
      isEmailUser,
      isGoogleUser,
      error,
    }),
    [currentUser, userLoggedIn, isEmailUser, isGoogleUser, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}
