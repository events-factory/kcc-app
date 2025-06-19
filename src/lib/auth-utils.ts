/**
 * Utilities for managing authentication state
 */

/**
 * Store authentication token in localStorage
 * @param token The JWT token to store
 * @returns boolean indicating success
 */
export const storeAuthToken = (token: string): boolean => {
  try {
    if (!token) {
      console.error('Cannot store empty token');
      return false;
    }

    // Direct localStorage access
    window.localStorage.setItem('token', token);

    // Verify storage
    const storedToken = window.localStorage.getItem('token');
    if (storedToken !== token) {
      console.error('Token storage verification failed');
      return false;
    }

    console.log('Token stored successfully:', token.substring(0, 10) + '...');
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

/**
 * Store user data in localStorage
 * @param user The user object to store
 * @returns boolean indicating success
 */
export const storeUserData = (user: any): boolean => {
  try {
    if (!user) {
      console.error('Cannot store empty user');
      return false;
    }

    window.localStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

/**
 * Get authentication token from localStorage
 * @returns The JWT token or null if not found
 */
export const getAuthToken = (): string | null => {
  try {
    const token = window.localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Get user data from localStorage
 * @returns The user object or null if not found
 */
export const getUserData = (): any => {
  try {
    const userData = window.localStorage.getItem('user');
    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Remove authentication data from localStorage
 */
export const clearAuthData = (): void => {
  try {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
