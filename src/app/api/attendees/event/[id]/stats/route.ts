import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../_middleware';

// Reference to the mock attendees array
// In a real app, this would be a database query
let attendees = [];

// GET attendance statistics for an event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authMiddleware(req, async (request) => {
    try {
      const resolvedParams = await params;
      const eventId = resolvedParams.id;

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
