import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../_middleware';

// Reference to the mock attendees array
// In a real app, this would be a database query
let attendees = [
  {
    id: '1',
    badgeId: 'B12345',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    eventId: '1',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 120 * 60000),
  },
  {
    id: '2',
    badgeId: 'B12346',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    eventId: '1',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 90 * 60000),
  },
  {
    id: '3',
    badgeId: 'B12347',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert@example.com',
    eventId: '1',
    checkedIn: false,
  },
];

// Mock entrance data
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
];

// Check in an attendee (protected)
export async function POST(req: NextRequest) {
  return authMiddleware(req, async (request) => {
    try {
      const { badgeId, entranceId } = await request.json();

      // Validation
      if (!badgeId) {
        return NextResponse.json(
          { message: 'Badge ID is required' },
          { status: 400 }
        );
      }

      // Find attendee by badge ID
      const attendeeIndex = attendees.findIndex(
        (attendee) => attendee.badgeId === badgeId
      );

      if (attendeeIndex === -1) {
        return NextResponse.json(
          { message: 'Attendee not found' },
          { status: 404 }
        );
      }

      const attendee = attendees[attendeeIndex];

      // Update attendee check-in status
      const updatedAttendee = {
        ...attendee,
        checkedIn: true,
        checkedInAt: new Date(),
      };

      attendees[attendeeIndex] = updatedAttendee;

      // If entrance ID is provided, update entrance scan count
      if (entranceId) {
        const entranceIndex = entrances.findIndex(
          (entrance) => entrance.id === entranceId
        );

        if (entranceIndex !== -1) {
          entrances[entranceIndex] = {
            ...entrances[entranceIndex],
            scanCount: entrances[entranceIndex].scanCount + 1,
            lastScanTime: new Date(),
          };
        }
      }

      return NextResponse.json(updatedAttendee);
    } catch (error) {
      console.error('Error checking in attendee:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
