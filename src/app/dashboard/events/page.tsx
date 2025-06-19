'use client';

import { Button } from '@/components/ui/button';
import { FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { Modal } from '@/components/ui/modal';
import { EventForm, EventData } from '@/components/events/event-form';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { eventService, Event, CreateEventData } from '@/services/event-service';
import { useAuth } from '@/context/AuthContext';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // We can assume user is authenticated because the layout already handles auth
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const handleOpenModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (eventData: EventData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (selectedEvent) {
        // Update existing event
        await eventService.updateEvent(selectedEvent.id, eventData);
      } else {
        // Create new event
        await eventService.createEvent(eventData as CreateEventData);
      }

      // Refresh events list
      fetchEvents();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save event:', err);
      setError('Failed to save event. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setIsLoading(true);
      setError(null);

      try {
        await eventService.deleteEvent(id);
        fetchEvents();
      } catch (err) {
        console.error('Failed to delete event:', err);
        setError('Failed to delete event. Please try again.');
        setIsLoading(false);
      }
    }
  };

  // Just show a loading spinner while fetching events
  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-2">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={handleOpenModal}
        >
          <FiPlus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {error && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 flex items-start gap-3">
          <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No events found</p>
            <Button
              variant="ghost"
              className="mt-2 text-blue-500"
              onClick={handleOpenModal}
            >
              Create your first event
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Event Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Attendee Limit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Registered
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      {event.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {event.attendeeLimit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {event.registered}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(event)}
                        >
                          Edit
                        </Button>
                        <Link href={`/dashboard/events/${event.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={selectedEvent ? 'Edit Event' : 'Create Event'}
        onClose={handleCloseModal}
      >
        <EventForm
          onSubmit={handleSubmit}
          initialData={
            selectedEvent
              ? {
                  name: selectedEvent.name,
                  attendeeLimit: selectedEvent.attendeeLimit,
                }
              : undefined
          }
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
