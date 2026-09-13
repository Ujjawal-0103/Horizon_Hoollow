import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api, ApiError } from '../services/api';

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export interface AuthContextType extends AuthState {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    grade?: number | string;
    board?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('mindtrace_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('mindtrace_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on mount (Section 16 & 29)
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('mindtrace_token');
      if (!savedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response && response.data) {
          setUser(response.data);
          localStorage.setItem('mindtrace_user', JSON.stringify(response.data));
          localStorage.setItem('mindtrace_user_id', response.data.id);
          localStorage.setItem('mindtrace_user_name', response.data.name);
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        localStorage.removeItem('mindtrace_token');
        localStorage.removeItem('mindtrace_user');
        localStorage.removeItem('mindtrace_user_id');
        localStorage.removeItem('mindtrace_user_name');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.data) {
      const { user: authedUser, token: authToken } = res.data;
      setUser(authedUser);
      setToken(authToken);
      localStorage.setItem('mindtrace_token', authToken);
      localStorage.setItem('mindtrace_user', JSON.stringify(authedUser));
      localStorage.setItem('mindtrace_user_id', authedUser.id);
      localStorage.setItem('mindtrace_user_name', authedUser.name);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    grade?: number | string;
    board?: string;
  }) => {
    const res = await api.register(payload);
    if (res.data) {
      const { user: authedUser, token: authToken } = res.data;
      setUser(authedUser);
      setToken(authToken);
      localStorage.setItem('mindtrace_token', authToken);
      localStorage.setItem('mindtrace_user', JSON.stringify(authedUser));
      localStorage.setItem('mindtrace_user_id', authedUser.id);
      localStorage.setItem('mindtrace_user_name', authedUser.name);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('mindtrace_token');
      localStorage.removeItem('mindtrace_user');
      localStorage.removeItem('mindtrace_user_id');
      localStorage.removeItem('mindtrace_user_name');
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteAccount();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('mindtrace_token');
      localStorage.removeItem('mindtrace_user');
      localStorage.removeItem('mindtrace_user_id');
      localStorage.removeItem('mindtrace_user_name');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('mindtrace_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        deleteAccount,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
