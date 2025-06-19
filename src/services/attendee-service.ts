import { apiClient } from '@/lib/api-client';

export interface Attendee {
  id: string;
  badgeId: string;
  firstName: string;
  lastName: string;
  email: string;
  eventId: string;
  checkedIn: boolean;
  checkedInAt?: Date;
}

export interface CreateAttendeeData {
  badgeId: string;
  firstName: string;
  lastName: string;
  email: string;
  eventId: string;
}

export interface CheckInData {
  badgeId: string;
  entranceId?: string;
}

export interface AttendanceStats {
  totalAttendees: number;
  checkedIn: number;
  percentage: number;
}

export interface RecentCheckIn {
  id: string;
  badgeId: string;
  firstName: string;
  lastName: string;
  email: string;
  checkedInAt: Date;
}

/**
 * Attendee service for managing attendees
 */
export const attendeeService = {
  /**
   * Get all attendees
   */
  async getAttendees(): Promise<Attendee[]> {
    return apiClient.get<Attendee[]>('/attendees');
  },

  /**
   * Get an attendee by ID
   * @param id Attendee ID
   */
  async getAttendee(id: string): Promise<Attendee> {
    return apiClient.get<Attendee>(`/attendees/${id}`);
  },

  /**
   * Get an attendee by badge ID
   * @param badgeId Badge ID
   */
  async getAttendeeByBadgeId(badgeId: string): Promise<Attendee> {
    return apiClient.get<Attendee>(`/attendees/badge/${badgeId}`);
  },

  /**
   * Register a new attendee
   * @param data Attendee data
   */
  async registerAttendee(data: CreateAttendeeData): Promise<Attendee> {
    return apiClient.post<Attendee>('/attendees/register', data);
  },

  /**
   * Check in an attendee
   * @param data Check-in data
   */
  async checkInAttendee(data: CheckInData): Promise<Attendee> {
    return apiClient.post<Attendee>('/attendees/check-in', data);
  },

  /**
   * Delete an attendee
   * @param id Attendee ID
   */
  async deleteAttendee(id: string): Promise<void> {
    return apiClient.delete<void>(`/attendees/${id}`);
  },

  /**
   * Get attendance statistics for an event
   * @param eventId Event ID
   */
  async getEventStats(eventId: string): Promise<AttendanceStats> {
    return apiClient.get<AttendanceStats>(`/attendees/event/${eventId}/stats`);
  },

  /**
   * Get recent check-ins for an event
   * @param eventId Event ID
   */
  async getRecentCheckIns(eventId: string): Promise<RecentCheckIn[]> {
    return apiClient.get<RecentCheckIn[]>(
      `/attendees/event/${eventId}/recent-check-ins`
    );
  },
};
