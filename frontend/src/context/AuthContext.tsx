import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User, AuthContextType, LoginResponse, UpdatePreferencesRequest } from '../types/auth.types';
import { apiService } from '../services/api.service';
import { API_CONFIG } from '../config/api.config';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@pantry_app_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Validate user with backend
        try {
          const response = await axios.get(
            `${API_CONFIG.AUTH}/me`,
            {
              headers: {
                'x-user-id': userData.id,
              },
            }
          );
          
          // User is valid, update with latest data from backend
          const validatedUser = response.data.user;
          setUser(validatedUser);
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(validatedUser));
          apiService.setUserId(validatedUser.id);
        } catch (error) {
          // User validation failed (user doesn't exist, invalid, etc.)
          // Clear stored user and show login screen
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
          apiService.setUserId('');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // On error, clear any potentially corrupted data
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, name?: string) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post<LoginResponse>(
        `${API_CONFIG.AUTH}/login`,
        { email, name },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Check if response has user data
      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server: missing user data');
      }

      const loggedInUser = response.data.user;

      // Save user to state and storage
      setUser(loggedInUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));

      // Sync with apiService
      apiService.setUserId(loggedInUser.id);
    } catch (error: any) {
      // Extract error message from axios error response
      let errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Unable to login. Please check your connection and try again.';
      
      // If it's a network error, provide more helpful message
      if (!error.response) {
        if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
          errorMessage = 'Network error: Could not reach server. Check your internet connection and verify the backend URL is correct.';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Connection refused: The server is not reachable. Verify the backend URL is correct.';
        } else {
          errorMessage = `Network error: ${error.message || 'Could not connect to server'}. Verify the backend URL is correct.`;
        }
      }
      
      // Include status code in error message if available
      const statusCode = error.response?.status;
      const fullErrorMessage = statusCode 
        ? `[${statusCode}] ${errorMessage}`
        : errorMessage;
      
      // Create a new error with the actual message
      const loginError = new Error(fullErrorMessage);
      (loginError as any).response = error.response;
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Clear user from state and storage
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

      // Clear apiService user ID
      apiService.setUserId('');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: UpdatePreferencesRequest) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error('No user logged in');
      }

      const response = await axios.put(
        `${API_CONFIG.AUTH}/preferences`,
        preferences,
        {
          headers: {
            'x-user-id': user.id,
          },
        }
      );

      const updatedUser = response.data.user;

      // Update user in state and storage
      setUser(updatedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
