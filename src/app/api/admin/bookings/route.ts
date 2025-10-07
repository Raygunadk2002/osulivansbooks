import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

// GET - List all bookings for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a booking as admin and assign to a user
export async function POST(request: NextRequest) {
  try {
    const { start_ts, end_ts, title, notes, bedroom_count, user_id, status } = await request.json();

    if (!start_ts || !end_ts) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    if (!bedroom_count || bedroom_count < 1 || bedroom_count > 4) {
      return NextResponse.json(
        { error: 'Bedroom count must be between 1 and 4' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        requester_id: user_id,
        status: status || 'APPROVED', // Default to approved for admin-created bookings
        start_ts: start_ts,
        end_ts: end_ts,
        title: title || 'Admin Created Booking',
        notes: notes || null,
        bedroom_count: bedroom_count
      })
      .select('*')
      .single();

    if (bookingError) {
      console.error('Database error:', bookingError);
      return NextResponse.json(
        { 
          error: 'Failed to create booking',
          details: bookingError.message,
          code: bookingError.code,
          hint: bookingError.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      booking: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
