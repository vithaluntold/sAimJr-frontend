/**
 * Saim Jr Accounting - Secure Authentication Hook
 * React hook for managing authentication state with production API
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, type LoginRequest, type RegisterRequest } from '@/lib/api-client-production';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        // Try to get user info or make a test authenticated request
        const response = await apiClient.healthCheck();
        if (response.error) {
          // Token might be expired, clear it
          apiClient.logout();
        } else {
          // For now, set a mock user. In real implementation, 
          // you'd get user info from a /me endpoint
          setUser({
            id: 1,
            username: 'current_user',
            email: 'user@example.com',
            is_active: true,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(credentials);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      // Set user data (in real implementation, get from API)
      setUser({
        id: 1,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        is_active: true,
        created_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}