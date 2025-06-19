import { apiClient } from '@/lib/api-client';

export interface Event {
  id: string;
  name: string;
  attendeeLimit: number;
  registered: number;
  date?: string;
  location?: string;
  description?: string;
}

export interface CreateEventData {
  name: string;
  attendeeLimit: number;
  date?: string;
  location?: string;
  description?: string;
}

export interface UpdateEventData {
  name?: string;
  attendeeLimit?: number;
  date?: string;
  location?: string;
  description?: string;
}

/**
 * Event service for managing events
 */
export const eventService = {
  /**
   * Get all events
   */
  async getEvents(): Promise<Event[]> {
    return apiClient.get<Event[]>('/events');
  },

  /**
   * Get an event by ID
   * @param id Event ID
   */
  async getEvent(id: string): Promise<Event> {
    return apiClient.get<Event>(`/events/${id}`);
  },

  /**
   * Create a new event
   * @param data Event data
   */
  async createEvent(data: CreateEventData): Promise<Event> {
    return apiClient.post<Event>('/events', data);
  },

  /**
   * Update an event
   * @param id Event ID
   * @param data Event data
   */
  async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
    return apiClient.put<Event>(`/events/${id}`, data);
  },

  /**
   * Delete an event
   * @param id Event ID
   */
  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete<void>(`/events/${id}`);
  },
};
