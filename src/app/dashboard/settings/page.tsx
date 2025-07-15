"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useEffect, useState } from "react";
import { entranceService, Entrance } from "@/services/entrance-service";

export default function SettingsPage() {
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntrance, setEditEntrance] = useState<Entrance | null>(null);
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch entrances on mount
  useEffect(() => {
    fetchEntrances();
  }, []);

  const fetchEntrances = async () => {
    setLoading(true);
    try {
      const data = await entranceService.getEntrances();
      setEntrances(data);
    } catch {
      setError("Failed to load entrances");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entrance?: Entrance) => {
    if (entrance) {
      setEditEntrance(entrance);
      setName(entrance.name);
      setEventId(entrance.eventId);
    } else {
      setEditEntrance(null);
      setName("");
      setEventId("");
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEntrance(null);
    setName("");
    setEventId("");
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editEntrance) {
        await entranceService.updateEntrance(editEntrance.id, { name, eventId });
      } else {
        await entranceService.createEntrance({ name, eventId });
      }
      await fetchEntrances();
      handleCloseModal();
    } catch (err) {
      setError((err as Error)?.message || "Failed to save entrance");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entrance?")) return;
    setSaving(true);
    try {
      await entranceService.deleteEntrance(id);
      await fetchEntrances();
    } catch {
      setError("Failed to delete entrance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Entrances</h2>
          <Button variant="primary" size="sm" className="flex items-center gap-2" onClick={() => handleOpenModal()}>
            <FiPlus className="h-4 w-4" />
            Add Entrance
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Entrance Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} className="px-4 py-3 text-center">Loading...</td></tr>
              ) : entrances.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-3 text-center text-gray-400">No entrances found.</td></tr>
              ) : (
                entrances.map((entrance) => (
                  <tr className="border-b" key={entrance.id}>
                    <td className="px-4 py-3 text-sm">{entrance.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleOpenModal(entrance)}>
                          <FiEdit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => handleDelete(entrance.id)}>
                          <FiTrash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editEntrance ? "Edit Entrance" : "Add Entrance"}>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Entrance Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Event ID</label>
              <input
                type="text"
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </Modal>
      </div>
      
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Event Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="default-limit" className="block text-sm font-medium text-gray-700 mb-1">
              Default Attendee Limit
            </label>
            <input
              type="number"
              id="default-limit"
              defaultValue={100}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex justify-end">
            <Button variant="primary">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
