import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Membership required' },
        { status: 403 }
      );
    }

    // Get bookings (APPROVED and PENDING)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        start_ts,
        end_ts,
        title,
        profiles!bookings_requester_id_fkey (
          display_name
        )
      `)
      .in('status', ['APPROVED', 'PENDING'])
      .order('start_ts', { ascending: true });

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Get visits
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select(`
        id,
        start_ts,
        end_ts,
        title,
        profiles!visits_created_by_fkey (
          display_name
        )
      `)
      .order('start_ts', { ascending: true });

    if (visitsError) {
      return NextResponse.json(
        { error: 'Failed to fetch visits' },
        { status: 500 }
      );
    }

    // Format events for FullCalendar
    const events = [
      // Bookings
      ...bookings.map(booking => ({
        id: `booking-${booking.id}`,
        title: booking.title || `Booking by ${booking.profiles?.display_name || 'Unknown'}`,
        start: booking.start_ts,
        end: booking.end_ts,
        allDay: true,
        extendedProps: {
          status: booking.status,
          type: 'BOOKING',
          bookingId: booking.id
        }
      })),
      // Visits
      ...visits.map(visit => ({
        id: `visit-${visit.id}`,
        title: visit.title,
        start: visit.start_ts,
        end: visit.end_ts,
        allDay: true,
        extendedProps: {
          type: 'VISIT',
          visitId: visit.id
        }
      }))
    ];

    return NextResponse.json(events);
  } catch (error) {
    console.error('Get FullCalendar events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
