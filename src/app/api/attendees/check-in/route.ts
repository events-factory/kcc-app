import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../_middleware';
import { Attendee } from '@/types';

// Reference to the mock attendees array
// In a real app, this would be a database query
let attendees = [];

// Mock entrance data
const entrances = [];

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

      // Find entrance name if entranceId is provided
      let entranceName = undefined;
      if (entranceId) {
        const entrance = entrances.find((e) => e.id === entranceId);
        entranceName = entrance?.name;
      }

      // Update attendee check-in status
      const updatedAttendee = {
        ...attendee,
        checkedIn: true,
        checkedInAt: new Date(),
        entrance: entranceName,
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
