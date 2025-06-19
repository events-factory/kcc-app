import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface EventFormProps {
  onClose: () => void;
  onSubmit: (eventData: EventData) => void;
  initialData?: EventData;
}

export interface EventData {
  name: string;
  attendeeLimit: number;
}

export const EventForm = ({
  onClose,
  onSubmit,
  initialData,
}: EventFormProps) => {
  const [formData, setFormData] = useState<EventData>({
    name: '',
    attendeeLimit: 100,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    attendeeLimit?: string;
  }>({});

  // Set initial data when editing an event
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'attendeeLimit' ? parseInt(value, 10) || 0 : value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      attendeeLimit?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.attendeeLimit || formData.attendeeLimit <= 0) {
      newErrors.attendeeLimit = 'Attendee limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Event Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full rounded-md border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          placeholder="Annual Conference 2025"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="attendeeLimit"
          className="block text-sm font-medium text-gray-700"
        >
          Attendee Limit
        </label>
        <input
          type="number"
          id="attendeeLimit"
          name="attendeeLimit"
          value={formData.attendeeLimit}
          onChange={handleChange}
          className={`w-full rounded-md border ${
            errors.attendeeLimit ? 'border-red-500' : 'border-gray-300'
          } p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          min="1"
        />
        {errors.attendeeLimit && (
          <p className="text-sm text-red-600">{errors.attendeeLimit}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};
