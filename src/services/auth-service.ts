import { apiClient } from '@/lib/api-client';
import { storeAuthToken, storeUserData } from '@/lib/auth-utils';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  token: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authentication service for login and registration
 */
export const authService = {
  /**
   * Register a new user
   * @param data User registration data
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    // Ensure token is stored
    if (response && response.token) {
      storeAuthToken(response.token);
      storeUserData(response.user);
    }

    return response;
  },

  /**
   * Login a user
   * @param data User login data
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Sending login request for:', data.email);

      // Make a direct fetch request to login endpoint
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || ''
        }/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Raw login response:', responseData);

      // Extract the correct structure based on the actual API response
      const authResponse: AuthResponse = {
        user: responseData.user,
        token: responseData.accessToken || responseData.token, // Try both possible token field names
      };

      // Check if we have a token in any format
      if (!authResponse.token && responseData.access_token) {
        authResponse.token = responseData.access_token; // Try snake_case format
      }

      console.log('Processed auth response:', {
        user: authResponse.user,
        tokenExists: !!authResponse.token,
        tokenPreview: authResponse.token
          ? authResponse.token.substring(0, 10) + '...'
          : 'none',
      });

      // Directly store token and user data using our utilities
      if (authResponse.token) {
        console.log('Storing auth data in localStorage...');
        const tokenSaved = storeAuthToken(authResponse.token);
        const userSaved = storeUserData(authResponse.user);

        if (!tokenSaved || !userSaved) {
          console.error('Failed to save auth data to localStorage');
          throw new Error('Failed to save authentication data');
        }

        // Double check that token was stored
        const storedToken = localStorage.getItem('token');
        console.log('Token storage verification:', !!storedToken);
      } else {
        console.error('No token received in login response');
        throw new Error('No authentication token received from server');
      }

      return authResponse;
    } catch (error) {
      console.error('Login error in auth service:', error);
      throw error;
    }
  },

  /**
   * Get the current user profile
   * Used to validate the authentication token
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/profile');
  },
};
