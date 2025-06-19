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
  {
    id: '4',
    badgeId: 'B12348',
    firstName: 'Emily',
    lastName: 'Williams',
    email: 'emily@example.com',
    eventId: '1',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 30 * 60000),
  },
  {
    id: '5',
    badgeId: 'B12349',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael@example.com',
    eventId: '1',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 15 * 60000),
  },
];

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
