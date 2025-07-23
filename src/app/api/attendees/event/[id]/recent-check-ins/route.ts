import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../_middleware';
import { Attendee } from '@/types';

// Reference to the mock attendees array
// In a real app, this would be a database query
const attendees: Attendee[] = [];

// GET recent check-ins for an event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authMiddleware(req, async (request) => {
    try {
      const resolvedParams = await params;
      const eventId = resolvedParams.id;

      // Get attendees for this event who have checked in
      const checkedInAttendees = attendees.filter(
        (attendee) => attendee.eventId === eventId && attendee.checkedIn
      );

      // Sort by check-in time (most recent first)
      const sortedAttendees = [...checkedInAttendees].sort((a, b) => {
        const aTime = a.checkedInAt ? a.checkedInAt.getTime() : 0;
        const bTime = b.checkedInAt ? b.checkedInAt.getTime() : 0;
        return bTime - aTime;
      });

      // Get the 10 most recent check-ins
      const recentCheckIns = sortedAttendees.slice(0, 10).map((attendee) => ({
        id: attendee.id,
        badgeId: attendee.badgeId,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        checkedInAt: attendee.checkedInAt,
      }));

      return NextResponse.json(recentCheckIns);
    } catch (error) {
      console.error('Error fetching recent check-ins:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
