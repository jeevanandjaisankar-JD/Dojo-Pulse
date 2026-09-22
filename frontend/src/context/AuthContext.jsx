import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginMentor, getMentorProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [mentor, setMentor] = useState(() => {
    const saved = localStorage.getItem('dojo_mentor_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('dojo_mentor_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const data = await getMentorProfile();
          if (data.success && data.mentor) {
            setMentor(data.mentor);
            localStorage.setItem('dojo_mentor_user', JSON.stringify(data.mentor));
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (username, password) => {
    const data = await loginMentor(username, password);
    if (data.success) {
      setToken(data.token);
      setMentor(data.mentor);
      localStorage.setItem('dojo_mentor_token', data.token);
      localStorage.setItem('dojo_mentor_user', JSON.stringify(data.mentor));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    setToken(null);
    setMentor(null);
    localStorage.removeItem('dojo_mentor_token');
    localStorage.removeItem('dojo_mentor_user');
  };

  return (
    <AuthContext.Provider
      value={{
        mentor,
        token,
        isAuthenticated: !!mentor && !!token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
