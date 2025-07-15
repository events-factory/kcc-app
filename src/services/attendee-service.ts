import { apiClient } from '@/lib/api-client';
import { Attendee } from '@/types';

export interface CreateAttendeeData {
  badgeId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  eventId: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
}

export interface BulkUploadData {
  attendeesData: CreateAttendeeData[];
  eventId: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  createdCount: number;
  errorCount: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
  createdAttendees: Attendee[];
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
      `/attendees/event/${eventId}/recent-check-ins?limit=10`
    );
  },

  /**
   * Bulk upload attendees (registers multiple attendees individually)
   * @param data Bulk upload data
   */
  async bulkUploadAttendees(data: BulkUploadData): Promise<BulkUploadResponse> {
    const { attendeesData, eventId } = data;
    const createdAttendees: Attendee[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    // Register each attendee individually since backend doesn't support bulk upload
    for (let i = 0; i < attendeesData.length; i++) {
      const attendeeData = attendeesData[i];
      try {
        // Map the data to match backend expectations
        const backendData = {
          badgeId: attendeeData.badgeId,
          firstName: attendeeData.firstName || '',
          lastName: attendeeData.lastName || '',
          email: attendeeData.email || '',
          eventId: parseInt(eventId), // Backend expects number based on the screenshot
          phone: attendeeData.phone || '',
          organization: attendeeData.company || '', // Backend expects 'organization', not 'company'
        };

        const createdAttendee = await apiClient.post<Attendee>(
          '/attendees/register',
          backendData
        );
        createdAttendees.push(createdAttendee);
      } catch (error) {
        errors.push({
          row: i + 1,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to register attendee',
        });
      }
    }

    return {
      success: errors.length === 0,
      message: `Successfully registered ${createdAttendees.length} attendees`,
      createdCount: createdAttendees.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      createdAttendees,
    };
  },
};
