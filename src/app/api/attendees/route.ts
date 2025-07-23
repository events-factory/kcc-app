import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../_middleware';
import { Attendee } from '@/types';

// Mock attendee data
const attendees: Attendee[] = [];

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

// POST bulk upload attendees (protected)
export async function POST(req: NextRequest) {
  return authMiddleware(req, async (request) => {
    try {
      const body = await request.json();
      const { attendeesData, eventId } = body;

      // Validate required fields
      if (!attendeesData || !Array.isArray(attendeesData)) {
        return NextResponse.json(
          { error: 'Invalid request: attendeesData must be an array' },
          { status: 400 }
        );
      }

      if (!eventId) {
        return NextResponse.json(
          { error: 'Event ID is required' },
          { status: 400 }
        );
      }

      const createdAttendees: Attendee[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      // Process each attendee
      for (let i = 0; i < attendeesData.length; i++) {
        const attendeeData = attendeesData[i];

        try {
          // Validate required fields for each attendee
          if (
            !attendeeData.firstName ||
            !attendeeData.lastName ||
            !attendeeData.email
          ) {
            errors.push({
              row: i + 1,
              error: 'Missing required fields: firstName, lastName, or email',
            });
            continue;
          }

          // Check if email already exists
          const existingAttendee = attendees.find(
            (a) =>
              a.email.toLowerCase() === attendeeData.email.toLowerCase() &&
              a.eventId === eventId
          );

          if (existingAttendee) {
            errors.push({
              row: i + 1,
              error: `Email ${attendeeData.email} already exists for this event`,
            });
            continue;
          }

          // Generate unique ID and badge ID
          const newId: string = (
            attendees.length +
            createdAttendees.length +
            1
          ).toString();
          const badgeId: string =
            attendeeData.badgeId || `B${Date.now()}-${newId}`;

          const newAttendee: Attendee = {
            id: newId,
            badgeId,
            firstName: attendeeData.firstName.trim(),
            lastName: attendeeData.lastName.trim(),
            email: attendeeData.email.trim().toLowerCase(),
            eventId,
            checkedIn: false,
            ...(attendeeData.phone && { phone: attendeeData.phone.trim() }),
            ...(attendeeData.company && {
              company: attendeeData.company.trim(),
            }),
            ...(attendeeData.jobTitle && {
              jobTitle: attendeeData.jobTitle.trim(),
            }),
          };

          createdAttendees.push(newAttendee);
        } catch (error) {
          errors.push({
            row: i + 1,
            error: `Failed to process attendee: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          });
        }
      }

      // Add successfully created attendees to the mock database
      attendees.push(...createdAttendees);

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${createdAttendees.length} attendees`,
        createdCount: createdAttendees.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        createdAttendees,
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      return NextResponse.json(
        { error: 'Failed to process bulk upload' },
        { status: 500 }
      );
    }
  });
}
