import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../_middleware';

// Import the entrances array from the main route
// Note: This is a temporary solution. In production, use a proper database
// eslint-disable-next-line prefer-const
let entrances: Array<{
  id: string;
  name: string;
  eventId: string;
  scanCount: number;
  lastScanTime?: Date;
  maxCapacity?: number;
}> = [];

// GET specific entrance (protected)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authMiddleware(req, async () => {
    const { id } = await params;
    const entrance = entrances.find((e) => e.id === id);

    if (!entrance) {
      return NextResponse.json(
        { error: 'Entrance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entrance);
  });
}

// PUT update entrance (protected)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authMiddleware(req, async (request) => {
    try {
      const { id } = await params;
      const { name, eventId, maxCapacity } = await request.json();

      const entranceIndex = entrances.findIndex((e) => e.id === id);
      if (entranceIndex === -1) {
        return NextResponse.json(
          { error: 'Entrance not found' },
          { status: 404 }
        );
      }

      // Update entrance
      const updatedEntrance = {
        ...entrances[entranceIndex],
        ...(name && { name }),
        ...(eventId && { eventId }),
        ...(maxCapacity !== undefined && { maxCapacity }),
      };

      entrances[entranceIndex] = updatedEntrance;
      return NextResponse.json(updatedEntrance);
    } catch (error) {
      console.error('Entrance update error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// DELETE entrance (protected)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authMiddleware(req, async () => {
    const { id } = await params;
    const entranceIndex = entrances.findIndex((e) => e.id === id);

    if (entranceIndex === -1) {
      return NextResponse.json(
        { error: 'Entrance not found' },
        { status: 404 }
      );
    }

    entrances.splice(entranceIndex, 1);
    return NextResponse.json({ success: true });
  });
}
