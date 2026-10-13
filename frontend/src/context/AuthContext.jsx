import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginMentor, getMentorProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [mentor, setMentor] = useState(() => {
    try {
      const saved = localStorage.getItem('dojo_mentor_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('dojo_mentor_user');
      localStorage.removeItem('dojo_mentor_token');
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('dojo_mentor_token') || null
  );

  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('dojo_mentor_token');
    localStorage.removeItem('dojo_mentor_user');
    setToken(null);
    setMentor(null);
  };

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        if (!token) return;

        const data = await getMentorProfile();

        if (cancelled) return;

        if (data.success && data.mentor) {
          setMentor(data.mentor);
          localStorage.setItem(
            'dojo_mentor_user',
            JSON.stringify(data.mentor)
          );
        } else {
          logout();
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (username, password) => {
    const data = await loginMentor(username, password);

    if (data.success) {
      localStorage.setItem('dojo_mentor_token', data.token);
      localStorage.setItem('dojo_mentor_user', JSON.stringify(data.mentor));

      setToken(data.token);
      setMentor(data.mentor);

      return { success: true };
    }

    return { success: false, message: data.message };
  };

  return (
    <AuthContext.Provider
      value={{
        mentor,
        token,
        isAuthenticated: Boolean(mentor && token),
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