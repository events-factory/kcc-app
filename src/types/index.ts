export interface Event {
  id: string;
  name: string;
  attendeeLimit: number;
}

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

export interface Restaurant {
  id: string;
  name: string;
}

export interface ScanReport {
  totalAttendees: number;
  checkedIn: number;
  lastCheckedIn: Attendee[];
}
