import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';

import { loginWithGoogle, getMentorProfile } from '../services/api';
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
  // A previously authenticated user can enter the app immediately while
  // the saved JWT is checked in the background.
  const [loading, setLoading] = useState(
    () => Boolean(getToken() && !readSavedUser())
  );
  const skipVerificationForToken = useRef(null);

  const logout = useCallback(() => {
    logoutSession();
    setTokenState(null);
    setUser(null);
    setLoading(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    // A successful Google login already returned a server-verified user.
    // Do not immediately call /auth/profile a second time for that same login.
    if (skipVerificationForToken.current === token) {
      skipVerificationForToken.current = null;
      setLoading(false);
      return undefined;
    }

    const hasCachedUser = Boolean(readSavedUser());
    if (!hasCachedUser) setLoading(true);
    else setLoading(false);

    const verifySession = async () => {
      try {
        const data = await getMentorProfile();
        if (cancelled) return;

        const profile = data?.user || data?.mentor;

        if (data?.success && profile?.role) {
          setUser(profile);
          saveUser(profile);
        } else {
          logout();
        }
      } catch (error) {
        if (cancelled) return;

        const status = error?.response?.status;
        // Only clear a session when the server explicitly rejects it.
        // Network errors and temporary server wake-ups must not sign users out.
        if (status === 401 || status === 403) {
          logout();
        } else if (!hasCachedUser) {
          setUser(null);
        }
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
    setUser(data.user);
    saveUser(data.user);

    // Mark the next token effect as already verified by /auth/google.
    skipVerificationForToken.current = data.token;
    setTokenState(data.token);
    setLoading(false);

    return {
      success: true,
      user: data.user
    };
  };

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
