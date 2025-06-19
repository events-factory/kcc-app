/**
 * Utility functions for debugging API issues
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const debugUtils = {
  /**
   * Test an API endpoint with the current token from localStorage
   * @param endpoint The API endpoint to test
   */
  async testApiWithCurrentToken(endpoint: string): Promise<void> {
    try {
      // Get the current token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No authentication token found in localStorage');
        return;
      }

      console.log(`Testing API endpoint: ${endpoint}`);
      console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);

      // Make the request with the token
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      // Parse response based on content type
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Response data:', data);
      } else {
        data = await response.text();
        console.log('Response text:', data);
      }

      if (!response.ok) {
        console.error('API request failed:', data);
      }

      return data;
    } catch (error) {
      console.error('API test failed:', error);
    }
  },

  /**
   * Get token information
   */
  getTokenInfo(): void {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      // Show token preview
      console.log(`Token (first 20 chars): ${token.substring(0, 20)}...`);

      // Decode JWT if possible (without validation)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Decoded token payload:', payload);

          // Check for expiration
          if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            console.log(`Token expires: ${expDate.toLocaleString()}`);
            console.log(`Current time: ${now.toLocaleString()}`);
            console.log(
              `Token is ${expDate > now ? 'still valid' : 'EXPIRED'}`
            );

            if (expDate < now) {
              console.error(
                'TOKEN IS EXPIRED! Please log in again to get a new token.'
              );
            }
          }
        }
      } catch (err) {
        console.error('Failed to decode token, may not be a valid JWT:', err);
      }
    } catch (err) {
      console.error('Error checking token info:', err);
    }
  },

  /**
   * Fix common authentication issues
   */
  fixAuthIssues(): void {
    // 1. Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found - please log in again');
      return;
    }

    // 2. Force token reload to all tabs by updating localStorage
    const user = localStorage.getItem('user');
    if (user) {
      // Re-save the token and user to ensure they're properly stored
      console.log('Re-saving token to localStorage to ensure persistence');
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      console.log('Auth data re-saved. Try refreshing the page.');
    }

    console.log('Authentication check complete.');
  },

  /**
   * Force logout and clear all auth data
   */
  forceLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logged out - all auth data cleared');
    window.location.href = '/login';
  },
};

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugApi = debugUtils;
}
