import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { start_ts, end_ts, title, notes, bedroom_count } = await request.json();

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

    const supabase = createServiceRoleClient();

    // For development, we'll use a mock user ID
    // In production, this would come from the authenticated user
    const mockUserId = 'mock-user-id';
    
    // Create the booking request
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        requester_id: mockUserId,
        status: 'PENDING',
        start_ts: start_ts,
        end_ts: end_ts,
        title: title || 'New Booking Request',
        notes: notes || null,
        bedroom_count: bedroom_count
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Database error:', bookingError);
      return NextResponse.json(
        { 
          error: 'Failed to create booking request',
          details: bookingError.message,
          code: bookingError.code
        },
        { status: 500 }
      );
    }

    console.log('Booking saved to database:', booking);
    return NextResponse.json({ 
      booking: booking,
      message: 'Booking request submitted successfully'
    });
  } catch (error) {
    console.error('Booking request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
