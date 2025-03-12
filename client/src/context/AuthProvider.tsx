
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/api';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const userData = await apiRequest('GET', '/api/auth/user');
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('فشل التحقق من المصادقة:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await apiRequest('POST', '/api/auth/login', { username, password });
      if (userData) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('فشل تسجيل الدخول:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('فشل تسجيل الخروج:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
