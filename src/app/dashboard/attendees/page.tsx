'use client';

import { Button } from '@/components/ui/button';
import { FiSearch, FiFilter, FiAlertTriangle } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { attendeeService } from '@/services/attendee-service';
import { eventService, Event } from '@/services/event-service';
import { Attendee } from '@/types';

export default function AttendeesPage() {
  // State management for attendees and search
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load attendee data
  const fetchAttendees = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await attendeeService.getAttendees();
      setAttendees(data);
      setFilteredAttendees(data);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
      setError('Failed to load attendees. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load events for the dropdown filter
  const fetchEvents = async () => {
    setError(null);

    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  useEffect(() => {
    fetchAttendees();
    fetchEvents();
  }, []);

  // Filter attendees based on search query and selected event
  useEffect(() => {
    if (attendees.length > 0) {
      let filtered = [...attendees];

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (attendee) =>
            attendee.firstName.toLowerCase().includes(query) ||
            attendee.lastName.toLowerCase().includes(query) ||
            attendee.email.toLowerCase().includes(query) ||
            attendee.badgeId.toLowerCase().includes(query)
        );
      }

      // Filter by selected event
      if (selectedEvent) {
        filtered = filtered.filter(
          (attendee) => attendee.eventId === selectedEvent
        );
      }

      setFilteredAttendees(filtered);
    }
  }, [searchQuery, selectedEvent, attendees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent(e.target.value);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not checked in';

    // Convert to local date string with relative time if recent
    const now = new Date();
    const checkInDate = new Date(date);
    const diffMs = now.getTime() - checkInDate.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMins < 1440) {
      // less than 24 hours
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return (
        checkInDate.toLocaleDateString() +
        ' ' +
        checkInDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
  };

  const getEventName = (eventId: string): string => {
    const event = events.find((e) => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendees</h1>

      {error && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 flex items-start gap-3">
          <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search and filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search attendees..."
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <FiFilter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            value={selectedEvent}
            onChange={handleEventChange}
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading attendees...</p>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {attendees.length === 0
                ? 'No attendees found. Please upload attendee data.'
                : 'No attendees match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Badge ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Check-in Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id}>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      {attendee.badgeId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {attendee.firstName} {attendee.lastName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {attendee.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {getEventName(attendee.eventId)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {attendee.checkedIn ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Checked in {formatDate(attendee.checkedInAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          Not checked in
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
