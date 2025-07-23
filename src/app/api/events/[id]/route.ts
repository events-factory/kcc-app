import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../_middleware';
import { Event } from '@/types';

// Reference to the mock events data from the parent route
// In a real app, this would be a database query
const events: Event[] = [];

// GET a specific event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const event = events.find((e) => e.id === resolvedParams.id);

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific event by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authMiddleware(req, async (request) => {
    try {
      const resolvedParams = await params;
      const eventId = resolvedParams.id;
      const eventIndex = events.findIndex((e) => e.id === eventId);

      if (eventIndex === -1) {
        return NextResponse.json(
          { message: 'Event not found' },
          { status: 404 }
        );
      }

      const updateData = await request.json();
      const currentEvent = events[eventIndex];

      // Update event with new data
      const updatedEvent = {
        ...currentEvent,
        ...updateData,
      };

      events[eventIndex] = updatedEvent;

      return NextResponse.json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// DELETE a specific event by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return authMiddleware(req, async () => {
    try {
      const resolvedParams = await params;
      const eventId = resolvedParams.id;
      const eventIndex = events.findIndex((e) => e.id === eventId);

      if (eventIndex === -1) {
        return NextResponse.json(
          { message: 'Event not found' },
          { status: 404 }
        );
      }

      // Remove event from array
      const deletedEvent = events.splice(eventIndex, 1)[0];

      return NextResponse.json({
        message: `Event "${deletedEvent.name}" deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
