
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import {
  loginWithGoogle,
  getMentorProfile
} from '../services/api';

import {
  getToken,
  setToken,
  logout as logoutSession
} from '../services/authService';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'dojo_auth_user';
const LEGACY_USER_STORAGE_KEY = 'dojo_mentor_user';

const readSavedUser = () => {
  try {
    const saved =
      localStorage.getItem(USER_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_USER_STORAGE_KEY);

    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    return null;
  }
};

const saveUser = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSavedUser);
  const [token, setTokenState] = useState(getToken);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    logoutSession();
    setTokenState(null);
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        if (!token) {
          setUser(null);
          return;
        }

        const data = await getMentorProfile();

        if (cancelled) return;

        const profile = data.user || data.mentor;

        if (data.success && profile && profile.role) {
          setUser(profile);
          saveUser(profile);
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
  }, [token, logout]);

  const loginGoogle = async (idToken) => {
    const data = await loginWithGoogle(idToken);

    if (!data.success || !data.token || !data.user) {
      return {
        success: false,
        message: data.message || 'Google sign-in failed.'
      };
    }

    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    saveUser(data.user);

    return {
      success: true,
      user: data.user
    };
  };

  // Preserve the alias used by existing mentor dashboard components.
  const mentor = user?.role === 'mentor' ? user : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        mentor,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        loginGoogle,
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

export { AuthProvider };
