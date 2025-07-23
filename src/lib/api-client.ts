// Simple API client for handling all API requests with authentication
import { getAuthToken } from './auth-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * API client for making HTTP requests with authentication
 */
export const apiClient = {
  /**
   * Make a GET request to the API
   * @param endpoint The API endpoint to call
   * @param options Additional fetch options
   * @returns The response data
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * Make a POST request to the API
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @param options Additional fetch options
   * @returns The response data
   */
  async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Make a PUT request to the API
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @param options Additional fetch options
   * @returns The response data
   */
  async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint The API endpoint to call
   * @param options Additional fetch options
   * @returns The response data
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  /**
   * Get the authentication token from localStorage
   */
  getAuthToken(): string | null {
    // Use the centralized auth utility instead of direct localStorage access
    const token = getAuthToken();

    if (token) {
      console.log(
        'Retrieved token successfully (first 10 chars):',
        token.substring(0, 10) + '...'
      );
    }

    return token;
  },

  /**
   * Make a request to the API
   * @param endpoint The API endpoint to call
   * @param options The fetch options
   * @returns The response data
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Get token using the centralized auth utility
    const token = this.getAuthToken();

    // Extract any headers passed in options
    const customHeaders = options.headers || {};

    // Build headers with content type and auth token
    // Note: We prioritize custom headers over default ones
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders, // Custom headers override defaults
    };

    const url = `${API_BASE_URL}${
      endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    }`;

    try {
      console.log(`Making API request: ${url}`);
      if (headers.Authorization) {
        // Log only part of the token for debugging (first 10 chars)
        const tokenPreview = token ? `${token.substring(0, 10)}...` : 'none';
        console.log(`Authorization header present with token: ${tokenPreview}`);
      } else {
        console.warn('No Authorization header in request - token missing');
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Log response status
      console.log(
        `API response from ${url}: ${response.status} ${response.statusText}`
      );

      // Check if we need to parse as JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle API errors
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Authentication required for', url);
          // Don't redirect immediately, let the component handle it
          throw new Error('Authentication required. Please log in.');
        }

        // For other error types
        const errorMessage = data.message || 'API request failed';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  },
};
