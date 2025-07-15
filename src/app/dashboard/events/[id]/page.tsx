'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiAlertTriangle,
  FiUsers,
  FiUserCheck,
  FiClock,
} from 'react-icons/fi';
import Link from 'next/link';
import { eventService } from '@/services/event-service';
import { entranceService, EntranceStats } from '@/services/entrance-service';
import { attendeeService } from '@/services/attendee-service';
import { useAuth } from '@/context/AuthContext';
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

interface RecentCheckIn {
  badgeId: string;
  attendeeName: string;
  checkInTime: string;
  entranceName: string;
}

export default function EventViewPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { user } = useAuth();

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
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [totalScanned, setTotalScanned] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);

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
    } catch {
      console.error('Failed to load event data');
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

  // Fetch recent check-ins
  const fetchRecentCheckIns = async () => {
    setIsRecentLoading(true);
    setRecentError(null);
    try {
      // You may need to adjust this call based on your API
      const data = await attendeeService.getRecentCheckIns(eventId);
      // Map the data to the RecentCheckIn interface shape
      const mapped = (data as any[]).map((item) => {
        return {
          badgeId: item.badgeId || '',
          attendeeName: item.attendeeName || item.name || '',
          checkInTime:
            item.checkInTime ||
            item.checkedInAt ||
            item.timestamp ||
            item.time ||
            '',
          entranceName: item.entranceName || item.entrance || 'Unknown',
        };
      });
      setRecentCheckIns(mapped);
    } catch {
      setRecentError('Failed to load recent check-ins.');
      setRecentCheckIns([]);
    } finally {
      setIsRecentLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEventData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]);

  // Load stats and recent check-ins separately after event data is loaded
  useEffect(() => {
    if (event && user) {
      fetchEntranceStats();
      fetchRecentCheckIns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, user]);

  const handleRefreshData = () => {
    fetchEventData();
    fetchEntranceStats();
    fetchRecentCheckIns();
  };

  // Calculate total attendees and checked in from /attendees endpoint filtered by eventId
  const [attendeeCounts, setAttendeeCounts] = useState<{
    total: number;
    checkedIn: number;
  }>({ total: 0, checkedIn: 0 });

  useEffect(() => {
    if (eventId) {
      attendeeService.getAttendees().then((allAttendees) => {
        // eventId from API is a number, params.id is a string, so cast for comparison
        const eventIdNum = Number(eventId);
        const eventAttendees = allAttendees.filter(
          (a) => Number(a.eventId) === eventIdNum
        );
        const checkedIn = eventAttendees.filter((a) => a.checkedIn).length;
        setAttendeeCounts({ total: eventAttendees.length, checkedIn });
      });
    }
  }, [eventId]);

  const total = attendeeCounts.total;
  console.log(
    'Total attendees:',
    total,
    'Checked in:',
    attendeeCounts.checkedIn
  );
  const checkedInDisplay = attendeeCounts.checkedIn;
  const attendeeLimit = event?.attendeeLimit || 0;
  const checkInRate =
    attendeeLimit > 0
      ? Math.round((checkedInDisplay / attendeeLimit) * 100)
      : 0;

  // Determine background color for check-in rate card
  let checkInBg = 'bg-green-100/70';
  let checkInIcon = 'text-green-600';
  if (checkInRate >= 90) {
    checkInBg = 'bg-red-100/70';
    checkInIcon = 'text-red-600';
  } else if (checkInRate >= 70) {
    checkInBg = 'bg-orange-100/70';
    checkInIcon = 'text-orange-500';
  }

  // Calculate scan reports by entrance from attendees endpoint
  const [entranceReports, setEntranceReports] = useState<{
    [entrance: string]: { count: number; lastScan: string | null };
  }>({});

  useEffect(() => {
    if (eventId) {
      attendeeService.getAttendees().then((allAttendees) => {
        const eventIdNum = Number(eventId);
        // Only include attendees who have actually checked in
        const eventAttendees = allAttendees.filter(
          (a) => Number(a.eventId) === eventIdNum && a.checkedIn
        );
        const entranceMap: {
          [entrance: string]: { count: number; lastScan: string | null };
        } = {};
        eventAttendees.forEach((a) => {
          // Use a string for entrance, fallback to 'Unknown' if not present
          const entrance = (a as any).entrance || 'Unknown';
          if (!entranceMap[entrance]) {
            entranceMap[entrance] = { count: 0, lastScan: null };
          }
          entranceMap[entrance].count++;
          // Use checkInTime or checkedInAt for last scan
          const lastScan = (a as any).checkInTime || a.checkedInAt || null;
          if (
            lastScan &&
            (!entranceMap[entrance].lastScan ||
              lastScan > entranceMap[entrance].lastScan)
          ) {
            entranceMap[entrance].lastScan = lastScan;
          }
        });
        setEntranceReports(entranceMap);
      });
    }
  }, [eventId]);

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
          <h1 className="text-2xl font-bold">{event?.name}</h1>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleRefreshData}
          disabled={isLoading || isStatsLoading || isRecentLoading}
        >
          <FiRefreshCw
            className={`h-4 w-4 ${
              isLoading || isStatsLoading || isRecentLoading
                ? 'animate-spin'
                : ''
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Total Attendees Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100/70">
              <FiUsers className="h-6 w-6 text-[#003480]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Attendees
              </p>
              <h3 className="text-2xl font-bold text-[#003480] mt-1">
                {total}
              </h3>
            </div>
          </div>
        </div>
        {/* Checked In Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100/70">
              <FiUserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Checked In</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {checkedInDisplay}
              </h3>
            </div>
          </div>
        </div>
        {/* Check-in Rate Card */}
        <div className={`rounded-lg border p-6 shadow-sm ${checkInBg}`}>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center h-12 w-12 rounded-full`}
            >
              <FiClock className={`h-6 w-6 ${checkInIcon}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Check-in Rate</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {checkInRate}%
              </h3>
            </div>
          </div>
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
          ) : Object.keys(entranceReports).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No entrance data available</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Object.entries(entranceReports).map(
                    ([entrance, data], index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                          {entrance}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          {data.count}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          {data.lastScan
                            ? new Date(data.lastScan).toLocaleString()
                            : 'No scans yet'}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Check-ins Table */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Check-ins</h2>
        <div className="rounded-lg border shadow-sm">
          {isRecentLoading ? (
            <div className="p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
              <p className="mt-2">Loading recent check-ins...</p>
            </div>
          ) : recentCheckIns.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No recent check-ins available</p>
              {recentError && (
                <Button
                  variant="ghost"
                  className="mt-2 text-blue-500"
                  onClick={fetchRecentCheckIns}
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
                      Attendee
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Check-in Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Entrance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {recentCheckIns.map((checkIn, idx) => (
                    <tr key={idx}>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                        {(checkIn as any).badgeId || checkIn.attendeeName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {checkIn.checkInTime
                          ? new Date(checkIn.checkInTime).toLocaleString()
                          : ''}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {checkIn.entranceName}
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
      {/* <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Check-in Activity Timeline</h3>
        {event && <CheckInActivityChart eventId={eventId} />}
      </div> */}
    </div>
  );
}
