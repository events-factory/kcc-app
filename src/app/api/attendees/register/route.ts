import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../_middleware';

// Reference to the mock attendees array
// In a real app, this would be a database query
let attendees = [];

// Register a new attendee (protected)
export async function POST(req: NextRequest) {
  return authMiddleware(req, async (request) => {
    try {
      const { badgeId, firstName, lastName, email, eventId } =
        await request.json();

      // Validation
      if (!badgeId || !firstName || !lastName || !email || !eventId) {
        return NextResponse.json(
          { message: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check for duplicate badge ID
      if (attendees.some((attendee) => attendee.badgeId === badgeId)) {
        return NextResponse.json(
          { message: 'Badge ID already exists' },
          { status: 409 }
        );
      }

      // Create new attendee
      const newAttendee = {
        id: (attendees.length + 1).toString(),
        badgeId,
        firstName,
        lastName,
        email,
        eventId,
        checkedIn: false,
      };

      // Add to "database"
      attendees.push(newAttendee);

      // In a real app, update the event's registered count as well

      return NextResponse.json(newAttendee, { status: 201 });
    } catch (error) {
      console.error('Error registering attendee:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
