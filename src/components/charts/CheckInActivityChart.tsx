'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { attendeeService } from '@/services/attendee-service';
import { useAuth } from '@/context/AuthContext';

interface CheckInActivityData {
  hour: string;
  count: number;
}

interface CheckInActivityChartProps {
  eventId: string;
}

const generateTimeSlots = () => {
  const data: CheckInActivityData[] = [];
  const now = new Date();

  // Generate data for the last 12 hours with hourly intervals
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(now.getHours() - i);
    data.push({
      hour: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count: 0,
    });
  }

  return data;
};

export function CheckInActivityChart({ eventId }: CheckInActivityChartProps) {
  const [chartData, setChartData] = useState<CheckInActivityData[]>(
    generateTimeSlots()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Import useAuth to handle potential authentication issues
  const { logout } = useAuth();

  useEffect(() => {
    const fetchCheckInActivity = async () => {
      try {
        // Use the attendee service to get check-in data
        const recentCheckIns = await attendeeService.getRecentCheckIns(eventId);
        console.log('Received check-in data:', recentCheckIns);

        // Create a time slots template
        const timeSlots = generateTimeSlots();
        const checkInsByHour = new Map<string, number>();

        // Initialize with zero counts
        timeSlots.forEach((slot) => {
          checkInsByHour.set(slot.hour, 0);
        });

        // Process the check-ins
        recentCheckIns.forEach((checkIn) => {
          // Use checkedInAt from the response
          if (checkIn.checkedInAt) {
            const checkInTime = new Date(checkIn.checkedInAt);
            const hourKey = checkInTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            // Find the closest time slot
            const hours = Array.from(checkInsByHour.keys());
            const closestHour = hours.reduce((prev, curr) => {
              const prevTime = new Date(`1970/01/01 ${prev}`).getTime();
              const currTime = new Date(`1970/01/01 ${curr}`).getTime();
              const checkInTimeValue = new Date(
                `1970/01/01 ${hourKey}`
              ).getTime();

              return Math.abs(currTime - checkInTimeValue) <
                Math.abs(prevTime - checkInTimeValue)
                ? curr
                : prev;
            });

            checkInsByHour.set(
              closestHour,
              (checkInsByHour.get(closestHour) || 0) + 1
            );
          }
        });

        // Convert map to array for the chart
        const chartData = timeSlots.map((slot) => ({
          hour: slot.hour,
          count: checkInsByHour.get(slot.hour) || 0,
        }));

        setChartData(chartData);
      } catch (err) {
        console.error('Failed to load check-in activity:', err);

        // Handle authentication errors
        if (err instanceof Error && err.message.includes('Authentication required')) {
          logout();
        } else {
          setError('Failed to load check-in activity data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckInActivity();
  }, [eventId, logout]);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${value} check-ins`, 'Count']}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="count"
          name="Check-ins"
          stroke="#2563eb"
          fill="#93c5fd"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
