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
        setUser(userData);
        // Sync with apiService
        apiService.setUserId(userData.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, name?: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post<LoginResponse>(
        `${API_CONFIG.AUTH}/login`,
        { email, name }
      );

      const loggedInUser = response.data.user;

      // Save user to state and storage
      setUser(loggedInUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));

      // Sync with apiService
      apiService.setUserId(loggedInUser.id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
