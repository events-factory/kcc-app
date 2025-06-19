import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../_middleware';

// Mock entrance data - in a real app, this would be a database query
const entrances = [
  {
    id: '1',
    name: 'Main Entrance',
    eventId: '1',
    scanCount: 67,
    lastScanTime: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    name: 'VIP Entrance',
    eventId: '1',
    scanCount: 23,
    lastScanTime: new Date(Date.now() - 15 * 60000),
  },
  {
    id: '3',
    name: 'Staff Entrance',
    eventId: '1',
    scanCount: 15,
    lastScanTime: new Date(Date.now() - 30 * 60000),
  },
  {
    id: '4',
    name: 'Main Entrance',
    eventId: '2',
    scanCount: 45,
    lastScanTime: new Date(Date.now() - 10 * 60000),
  },
  {
    id: '5',
    name: 'Side Entrance',
    eventId: '2',
    scanCount: 20,
    lastScanTime: new Date(Date.now() - 20 * 60000),
  },
];

// GET entrance statistics for an event (protected)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(req, async (request) => {
    try {
      const eventId = params.id;

      // Get entrances for this event
      const eventEntrances = entrances.filter(
        (entrance) => entrance.eventId === eventId
      );

      if (eventEntrances.length === 0) {
        return NextResponse.json([]);
      }

      // Calculate total scan count for percentage calculation
      const totalScans = eventEntrances.reduce(
        (sum, entrance) => sum + entrance.scanCount,
        0
      );

      // Format the data for the client
      const entranceStats = eventEntrances.map((entrance) => ({
        entranceName: entrance.name,
        scannedCount: entrance.scanCount,
        lastScan: entrance.lastScanTime?.toLocaleTimeString(),
        percentage:
          totalScans > 0
            ? Math.round((entrance.scanCount / totalScans) * 100)
            : 0,
      }));

      return NextResponse.json(entranceStats);
    } catch (error) {
      console.error('Error fetching entrance stats:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
