'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FiArrowLeft, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import { eventService } from '@/services/event-service';
import { entranceService, EntranceStats } from '@/services/entrance-service';
import { attendeeService } from '@/services/attendee-service';
import { useAuth } from '@/context/AuthContext';
import { CheckInActivityChart } from '@/components/charts/CheckInActivityChart';
import { authService } from '@/services/auth-service';

interface EventDetails {
  registeredCount: number;
  checkedInCount: number;
  id: string;
  name: string;
  attendeeLimit: number;
  registered: number;
  date?: string;
  location?: string;
  description?: string;
}

export default function EventViewPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Add token validation function
  const { logout } = useAuth();
  const validateAuth = async () => {
    try {
      // Try to call the profile endpoint to validate the token
      await authService.getProfile();
      return true;
    } catch (err) {
      console.warn('Auth validation failed, redirecting to login');
      logout();
      return false;
    }
  };

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [entranceStats, setEntranceStats] = useState<EntranceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [totalScanned, setTotalScanned] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchEventData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load event details
      const eventData = await eventService.getEvent(eventId);
      
      // Transform Event to EventDetails format
      const eventDetails: EventDetails = {
        ...eventData,
        registeredCount: eventData.registered,
        checkedInCount: 0, // Will be updated when stats are loaded
      };
      
      setEvent(eventDetails);
    } catch (err) {
      console.error('Failed to load event data:', err);
      setError('Failed to load event data. Please try again later.');
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntranceStats = async () => {
    if (!eventId) return;

    setIsStatsLoading(true);
    setStatsError(null);

    try {
      // Load entrance statistics
      const stats = await entranceService.getEntranceStats(eventId);
      setEntranceStats(stats);

      // Calculate total from the stats
      const total = stats.reduce(
        (sum, entrance) => sum + entrance.scannedCount,
        0
      );
      setTotalScanned(total);
    } catch (statsErr) {
      console.error('Failed to load entrance statistics:', statsErr);

      // Validate authentication if stats fetch fails
      const isValid = await validateAuth();
      if (!isValid) {
        setStatsError('Authentication failed. Redirecting to login.');
      } else {
        setEntranceStats([]);
        setTotalScanned(0);
        setStatsError(
          'Event statistics could not be loaded. You may need to refresh or log in again.'
        );
      }
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEventData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]);

  // Load stats separately after event data is loaded
  useEffect(() => {
    if (event && user) {
      fetchEntranceStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, user]);

  const handleRefreshData = () => {
    fetchEventData();
    fetchEntranceStats();
  };

  if (isLoading && !event) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-2">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Event not found</h2>
        <Link href="/dashboard/events">
          <Button variant="ghost" className="mt-4">
            <FiArrowLeft className="mr-2" /> Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/events">
            <Button
              variant="ghost"
              className="mb-2 -ml-3 flex items-center gap-1"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{event.name}</h1>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleRefreshData}
          disabled={isLoading || isStatsLoading}
        >
          <FiRefreshCw
            className={`h-4 w-4 ${
              isLoading || isStatsLoading ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 flex items-start gap-3">
          <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {statsError && (
        <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 flex items-start gap-3">
          <FiAlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <p className="text-sm text-yellow-700">{statsError}</p>
        </div>
      )}

      {/* Event Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Registered</h3>
          <p className="mt-1 text-2xl font-semibold">{event.registeredCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Checked In</h3>
          {isStatsLoading ? (
            <div className="mt-1 flex items-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              <p className="mt-1 text-2xl font-semibold">
                {event.checkedInCount}
              </p>
              <p className="text-sm text-gray-500">
                {event.registeredCount > 0
                  ? Math.round(
                      (event.checkedInCount / event.registeredCount) * 100
                    )
                  : 0}
                % of registered
              </p>
            </>
          )}
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
          {isStatsLoading ? (
            <div className="mt-1 flex items-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <p className="mt-1 text-2xl font-semibold">
              {event.registeredCount - event.checkedInCount}
            </p>
          )}
        </div>
      </div>

      {/* Entrance Scan Reports */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Scan Reports by Entrance</h2>
        <div className="rounded-lg border shadow-sm">
          {isStatsLoading ? (
            <div className="p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
              <p className="mt-2">Loading entrance statistics...</p>
            </div>
          ) : entranceStats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No entrance data available</p>
              {statsError && (
                <Button
                  variant="ghost"
                  className="mt-2 text-blue-500"
                  onClick={fetchEntranceStats}
                >
                  Try again
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Entrance
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Scanned Attendees
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Last Scan
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {entranceStats.map((entrance, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                        {entrance.entranceName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {entrance.scannedCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {entrance.lastScan || 'No scans yet'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {totalScanned > 0
                          ? Math.round(
                              (entrance.scannedCount / totalScanned) * 100
                            )
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Check-in Activity Chart */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Check-in Activity Timeline</h3>
        {event && <CheckInActivityChart eventId={eventId} />}
      </div>
    </div>
  );
}
