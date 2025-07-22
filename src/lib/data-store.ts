import { Event, Attendee } from '@/types';

export interface Entrance {
  id: string;
  name: string;
  eventId: string;
  scanCount: number;
  lastScanTime?: Date;
  maxCapacity?: number;
}

// In-memory data store (replace with database in production)
class DataStore {
  private events: Event[] = [];
  private attendees: Attendee[] = [];
  private entrances: Entrance[] = [];

  // Events
  getEvents(): Event[] {
    return [...this.events];
  }

  getEvent(id: string): Event | undefined {
    return this.events.find((e) => e.id === id);
  }

  addEvent(event: Event): void {
    this.events.push(event);
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    this.events[index] = { ...this.events[index], ...updates };
    return this.events[index];
  }

  deleteEvent(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.events.splice(index, 1);
    return true;
  }

  // Attendees
  getAttendees(): Attendee[] {
    return [...this.attendees];
  }

  getAttendee(id: string): Attendee | undefined {
    return this.attendees.find((a) => a.id === id);
  }

  addAttendee(attendee: Attendee): void {
    this.attendees.push(attendee);
  }

  addAttendees(attendees: Attendee[]): void {
    this.attendees.push(...attendees);
  }

  updateAttendee(id: string, updates: Partial<Attendee>): Attendee | null {
    const index = this.attendees.findIndex((a) => a.id === id);
    if (index === -1) return null;

    this.attendees[index] = { ...this.attendees[index], ...updates };
    return this.attendees[index];
  }

  deleteAttendee(id: string): boolean {
    const index = this.attendees.findIndex((a) => a.id === id);
    if (index === -1) return false;

    this.attendees.splice(index, 1);
    return true;
  }

  // Entrances
  getEntrances(): Entrance[] {
    return [...this.entrances];
  }

  getEntrance(id: string): Entrance | undefined {
    return this.entrances.find((e) => e.id === id);
  }

  addEntrance(entrance: Entrance): void {
    this.entrances.push(entrance);
  }

  updateEntrance(id: string, updates: Partial<Entrance>): Entrance | null {
    const index = this.entrances.findIndex((e) => e.id === id);
    if (index === -1) return null;

    this.entrances[index] = { ...this.entrances[index], ...updates };
    return this.entrances[index];
  }

  deleteEntrance(id: string): boolean {
    const index = this.entrances.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.entrances.splice(index, 1);
    return true;
  }

  // Utility methods
  getNextEventId(): string {
    return (this.events.length + 1).toString();
  }

  getNextAttendeeId(): string {
    return (this.attendees.length + 1).toString();
  }

  getNextEntranceId(): string {
    return (this.entrances.length + 1).toString();
  }
}

// Single instance to be used across the application
export const dataStore = new DataStore();
