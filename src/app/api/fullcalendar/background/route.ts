import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
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

    // Get HOLD and BLOCKED bookings for background events
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, start_ts, end_ts, title')
      .in('status', ['HOLD', 'BLOCKED'])
      .order('start_ts', { ascending: true });

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch background bookings' },
        { status: 500 }
      );
    }

    // Format background events for FullCalendar
    const backgroundEvents = bookings.map(booking => ({
      start: booking.start_ts,
      end: booking.end_ts,
      display: 'background',
      extendedProps: {
        status: booking.status,
        type: 'BOOKING',
        bookingId: booking.id,
        title: booking.title
      }
    }));

    return NextResponse.json(backgroundEvents);
  } catch (error) {
    console.error('Get FullCalendar background events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
