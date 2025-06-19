import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../_middleware';

// Mock event data
let events = [
  {
    id: '1',
    name: 'Annual Conference 2025',
    attendeeLimit: 150,
    registered: 120,
    date: '2025-06-15',
    location: 'Convention Center',
    description: 'Our flagship annual conference',
  },
  {
    id: '2',
    name: 'Tech Summit',
    attendeeLimit: 100,
    registered: 85,
    date: '2025-08-20',
    location: 'Tech Hub',
    description: 'Technology summit for industry leaders',
  },
];

// GET all events
export async function GET(request: NextRequest) {
  // No authentication required for GET /events
  return NextResponse.json(events);
}

// POST a new event (protected, admin only)
export async function POST(req: NextRequest) {
  return authMiddleware(req, async (request) => {
    try {
      const { name, attendeeLimit, date, location, description } =
        await request.json();

      // Validate required fields
      if (!name || !attendeeLimit) {
        return NextResponse.json(
          { message: 'Name and attendeeLimit are required' },
          { status: 400 }
        );
      }

      // Create new event
      const newEvent = {
        id: (events.length + 1).toString(),
        name,
        attendeeLimit,
        registered: 0,
        date,
        location,
        description,
      };

      events.push(newEvent);
      return NextResponse.json(newEvent, { status: 201 });
    } catch (error) {
      console.error('Event creation error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
