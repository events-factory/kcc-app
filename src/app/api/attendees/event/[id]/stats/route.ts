import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../_middleware';

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

// GET attendance statistics for an event
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(req, async (request) => {
    try {
      const eventId = params.id;

      // Get attendees for this event
      const eventAttendees = attendees.filter(
        (attendee) => attendee.eventId === eventId
      );

      // Count checked-in attendees
      const checkedInAttendees = eventAttendees.filter(
        (attendee) => attendee.checkedIn
      );

      const totalAttendees = eventAttendees.length;
      const checkedIn = checkedInAttendees.length;

      return NextResponse.json({
        totalAttendees,
        checkedIn,
        percentage:
          totalAttendees > 0
            ? Math.round((checkedIn / totalAttendees) * 100)
            : 0,
      });
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
