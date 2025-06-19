import { apiClient } from '@/lib/api-client';

export interface Entrance {
  id: string;
  name: string;
  eventId: string;
  scanCount: number;
  lastScanTime?: Date;
}

export interface CreateEntranceData {
  name: string;
  eventId: string;
}

export interface UpdateEntranceData {
  name?: string;
  eventId?: string;
}

export interface EntranceStats {
  entranceName: string;
  scannedCount: number;
  lastScan?: string;
  percentage: number;
}

// API response interface matching the actual API structure
interface EntranceStatsResponse {
  entrances: {
    name: string;
    count: number;
    percentage: number;
  }[];
  totalCheckedIn: number;
}

/**
 * Entrance service for managing entrances
 */
export const entranceService = {
  /**
   * Get all entrances
   */
  async getEntrances(): Promise<Entrance[]> {
    return apiClient.get<Entrance[]>('/entrances');
  },

  /**
   * Get an entrance by ID
   * @param id Entrance ID
   */
  async getEntrance(id: string): Promise<Entrance> {
    return apiClient.get<Entrance>(`/entrances/${id}`);
  },

  /**
   * Create a new entrance
   * @param data Entrance data
   */
  async createEntrance(data: CreateEntranceData): Promise<Entrance> {
    return apiClient.post<Entrance>('/entrances', data);
  },

  /**
   * Update an entrance
   * @param id Entrance ID
   * @param data Entrance data
   */
  async updateEntrance(
    id: string,
    data: UpdateEntranceData
  ): Promise<Entrance> {
    return apiClient.put<Entrance>(`/entrances/${id}`, data);
  },

  /**
   * Delete an entrance
   * @param id Entrance ID
   */
  async deleteEntrance(id: string): Promise<void> {
    return apiClient.delete<void>(`/entrances/${id}`);
  },

  /**
   * Get entrance statistics for an event
   * @param eventId Event ID
   */
  async getEntranceStats(eventId: string): Promise<EntranceStats[]> {
    try {
      // Now using the actual API endpoint with apiClient
      const response = await apiClient.get<EntranceStatsResponse>(
        `/entrances/event/${eventId}/stats`
      );

      // Transform the API response format to match our interface
      if (response && response.entrances) {
        return response.entrances.map((entrance) => ({
          entranceName: entrance.name,
          scannedCount: entrance.count || 0,
          percentage: entrance.percentage || 0,
          lastScan: undefined, // API doesn't provide this
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Failed to fetch entrance stats:', error);

      // Special handling for authentication errors
      if (error?.message?.includes('Authentication required')) {
        console.warn(
          'Authentication issue detected, attempting to refresh token status'
        );
        // Let the calling component handle the auth error appropriately
      }

      throw error;
    }
  },

  /**
   * Increment scan count for an entrance
   * @param id Entrance ID
   */
  async incrementScanCount(id: string): Promise<Entrance> {
    return apiClient.post<Entrance>(`/entrances/${id}/increment-scan`, {});
  },
};
