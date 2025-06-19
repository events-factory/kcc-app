'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthResponse } from '@/services/auth-service';
import {
  storeAuthToken,
  storeUserData,
  getAuthToken,
  getUserData,
  clearAuthData,
} from '@/lib/auth-utils';

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
  token: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if the user is logged in when the app loads
  useEffect(() => {
    if (!mounted) return;

    const checkLoggedIn = async () => {
      try {
        // Check localStorage for user data and token using our utility functions
        const storedUser = getUserData();
        const storedToken = getAuthToken();

        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);

          // Validate token by making a profile request
          try {
            await authService.getProfile();
            console.log('Token validated successfully');
          } catch (error) {
            console.warn('Stored token is invalid, logging out');
            // If token validation fails, log the user out
            logout();
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, [mounted]);

  const saveAuthData = ({ user, token }: AuthResponse) => {
    // Use our utility functions for more reliable storage
    const tokenSaved = storeAuthToken(token);
    const userSaved = storeUserData(user);

    if (tokenSaved && userSaved) {
      console.log('Auth data saved successfully');
      setUser(user);
      setToken(token);
      return true;
    } else {
      console.error('Failed to save auth data');
      return false;
    }
  };

  // Login function - calls the API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);

      // Call the authentication API
      const response = await authService.login({ email, password });
      console.log('Login successful, received token and user data');

      // Save user data and token
      const saved = saveAuthData(response);

      return saved;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call the registration API
      const response = await authService.register({ name, email, password });

      // Save user data and token
      const saved = saveAuthData(response);
      return saved;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Use our utility function to clear auth data
    clearAuthData();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
