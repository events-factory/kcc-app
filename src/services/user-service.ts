import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

/**
 * User service for managing users
 */
export const userService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  },

  /**
   * Get a user by ID
   * @param id User ID
   */
  async getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Create a new user
   * @param data User data
   */
  async createUser(data: CreateUserData): Promise<User> {
    return apiClient.post<User>('/users', data);
  },

  /**
   * Update a user
   * @param id User ID
   * @param data User data
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  /**
   * Delete a user
   * @param id User ID
   */
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  },
};
