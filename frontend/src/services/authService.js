const TOKEN_KEY = 'dojo_mentor_token';

/**
 * Get the currently stored authentication token.
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check whether an authentication token exists.
 */
export const isAuthenticated = () => {
  return Boolean(getToken());
};

/**
 * Store an authentication token.
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the authentication token and end the local session.
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};
