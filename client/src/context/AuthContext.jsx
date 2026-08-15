import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state on mount via /auth/me
  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem('sentiticket_at');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
        setOrganization(data.data.organization);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('sentiticket_at');
        setUser(null);
        setOrganization(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.requiresMfa) {
      return { requiresMfa: true, mfaToken: data.data.mfaToken };
    }
    localStorage.setItem('sentiticket_at', data.data.accessToken);
    setUser(data.data.user);
    setOrganization(data.data.organization);
    setIsAuthenticated(true);
    return { requiresMfa: false, user: data.data.user };
  };

  const verifyMfa = async (mfaToken, totpCode) => {
    const { data } = await api.post('/auth/mfa/verify', { mfaToken, totpCode });
    localStorage.setItem('sentiticket_at', data.data.accessToken);
    setUser(data.data.user);
    setOrganization(data.data.organization);
    setIsAuthenticated(true);
    return data.data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('sentiticket_at', data.data.accessToken);
    setUser(data.data.user);
    setOrganization(data.data.organization);
    setIsAuthenticated(true);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout network errors
    } finally {
      localStorage.removeItem('sentiticket_at');
      setUser(null);
      setOrganization(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated,
        isLoading,
        login,
        verifyMfa,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
