import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../_middleware';

export interface Entrance {
  id: string;
  name: string;
  eventId: string;
  scanCount: number;
  lastScanTime?: Date;
  maxCapacity?: number;
}

// In-memory storage for entrances (replace with database in production)
// eslint-disable-next-line prefer-const
let entrances: Entrance[] = [];

// GET all entrances (protected)
export async function GET(req: NextRequest) {
  return authMiddleware(req, async () => {
    return NextResponse.json(entrances);
  });
}

// POST create new entrance (protected)
export async function POST(req: NextRequest) {
  return authMiddleware(req, async (request) => {
    try {
      const { name, eventId, maxCapacity } = await request.json();

      // Validate required fields
      if (!name || !eventId) {
        return NextResponse.json(
          { error: 'Name and eventId are required' },
          { status: 400 }
        );
      }

      // Check if entrance already exists for this event
      const existingEntrance = entrances.find(
        (e) => e.name === name && e.eventId === eventId
      );

      if (existingEntrance) {
        return NextResponse.json(
          { error: 'Entrance with this name already exists for this event' },
          { status: 409 }
        );
      }

      // Create new entrance
      const newEntrance: Entrance = {
        id: (entrances.length + 1).toString(),
        name,
        eventId,
        scanCount: 0,
        ...(maxCapacity && { maxCapacity }),
      };

      entrances.push(newEntrance);
      return NextResponse.json(newEntrance, { status: 201 });
    } catch (error) {
      console.error('Entrance creation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
