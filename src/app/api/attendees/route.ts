import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../_middleware';

// Mock attendee data
let attendees = [
  {
    id: '1',
    badgeId: 'B12345',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    eventId: '1', // Annual Conference 2025
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 120 * 60000),
  },
  {
    id: '2',
    badgeId: 'B12346',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    eventId: '1', // Annual Conference 2025
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 90 * 60000),
  },
  {
    id: '3',
    badgeId: 'B12347',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert@example.com',
    eventId: '1', // Annual Conference 2025
    checkedIn: false,
  },
];

// GET all attendees (protected)
export async function GET(req: NextRequest) {
  return authMiddleware(req, async (request) => {
    // Optional query parameters for filtering
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');

    let result = [...attendees];

    // Filter by eventId if provided
    if (eventId) {
      result = result.filter((attendee) => attendee.eventId === eventId);
    }

    return NextResponse.json(result);
  });
}
