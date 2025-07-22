'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { entranceService, Entrance } from '@/services/entrance-service';
import { eventService } from '@/services/event-service';
import { Event } from '@/types';

export default function SettingsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntrance, setEditEntrance] = useState<Entrance | null>(null);
  const [name, setName] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // Load the current event
  useEffect(() => {
    if (eventId) {
      eventService
        .getEvent(eventId)
        .then((event) => {
          setCurrentEvent(event);
        })
        .catch(console.error);
    }
  }, [eventId]);

  // Fetch entrances on mount
  useEffect(() => {
    const fetchEntrances = async () => {
      setLoading(true);
      try {
        const data = await entranceService.getEntrances();
        console.log('All entrances:', data);
        console.log('Event ID from URL:', eventId);
        // Filter entrances for this specific event
        const eventEntrances = data.filter((entrance) => {
          console.log(
            'Entrance eventId:',
            entrance.eventId,
            'URL eventId:',
            eventId
          );
          return String(entrance.eventId) === String(eventId);
        });
        console.log('Filtered entrances:', eventEntrances);
        setEntrances(eventEntrances);
      } catch (err) {
        console.error('Error fetching entrances:', err);
        setError('Failed to load entrances');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEntrances();
    }
  }, [eventId]);

  const fetchEntrances = async () => {
    setLoading(true);
    try {
      const data = await entranceService.getEntrances();
      // Filter entrances for this specific event
      const eventEntrances = data.filter(
        (entrance) => String(entrance.eventId) === String(eventId)
      );
      setEntrances(eventEntrances);
    } catch (err) {
      console.error('Error fetching entrances:', err);
      setError('Failed to load entrances');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entrance?: Entrance) => {
    if (entrance) {
      setEditEntrance(entrance);
      setName(entrance.name);
      setMaxCapacity(entrance.maxCapacity ?? '');
    } else {
      setEditEntrance(null);
      setName('');
      setMaxCapacity('');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEntrance(null);
    setName('');
    setMaxCapacity('');
    setError(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Entrance name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const entranceData = {
        name: name.trim(),
        eventId: eventId,
        ...(maxCapacity !== '' && { maxCapacity: Number(maxCapacity) }),
      };

      if (editEntrance) {
        // Update existing entrance
        await entranceService.updateEntrance(editEntrance.id, entranceData);
      } else {
        // Create new entrance
        await entranceService.createEntrance(entranceData);
      }
      await fetchEntrances();
      handleCloseModal();
    } catch (err) {
      setError(
        editEntrance ? 'Failed to update entrance' : 'Failed to create entrance'
      );
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entrance: Entrance) => {
    if (!confirm('Are you sure you want to delete this entrance?')) {
      return;
    }

    try {
      await entranceService.deleteEntrance(entrance.id);
      await fetchEntrances();
    } catch {
      setError('Failed to delete entrance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/events/${eventId}`}>
            <Button
              variant="ghost"
              className="mb-2 -ml-3 flex items-center gap-1"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Event Settings</h1>
          {currentEvent && (
            <p className="text-gray-600">Event: {currentEvent.name}</p>
          )}
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Add Entrance
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium">Entrance Management</h2>
          <p className="text-sm text-gray-600">
            Manage entrances for this event. Each entrance can be used for
            check-ins.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
            <p className="mt-2">Loading entrances...</p>
          </div>
        ) : entrances.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No entrances configured for this event.
            </p>
            <Button
              onClick={() => handleOpenModal()}
              className="mt-4 flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add First Entrance
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Entrance Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Max Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    ID
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entrances.map((entrance) => (
                  <tr key={entrance.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {entrance.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {entrance.maxCapacity
                        ? entrance.maxCapacity.toLocaleString()
                        : 'No limit'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {entrance.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(entrance)}
                          className="flex items-center gap-1"
                        >
                          <FiEdit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entrance)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 className="h-3 w-3" />
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

      {/* Create/Edit Entrance Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editEntrance ? 'Edit Entrance' : 'Create New Entrance'}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="entrance-name"
              className="block text-sm font-medium text-gray-700"
            >
              Entrance Name
            </label>
            <input
              type="text"
              id="entrance-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Main Entrance, VIP Entrance"
            />
          </div>

          <div>
            <label
              htmlFor="max-capacity"
              className="block text-sm font-medium text-gray-700"
            >
              Max Capacity (optional)
            </label>
            <input
              type="number"
              id="max-capacity"
              value={maxCapacity}
              onChange={(e) =>
                setMaxCapacity(
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 100, 500"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for no capacity limit
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editEntrance ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
