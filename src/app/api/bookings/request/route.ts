import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { toInstant } from '@/lib/gaps';

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

    // For development, we'll use a real user ID that exists
    // In production, this would come from the authenticated user
    const mockUserId = '45df5c03-76bf-43e5-b379-e11d9d109a87'; // admin@example.com
    
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
        { error: 'Failed to create booking request' },
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
