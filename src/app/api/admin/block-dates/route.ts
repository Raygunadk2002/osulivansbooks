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

    // For development, we'll use a real admin user ID
    // In production, this would come from the authenticated admin user
    const mockAdminId = '45df5c03-76bf-43e5-b379-e11d9d109a87'; // admin@example.com

    // Create a blocked booking
    const { data: blockedBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        requester_id: mockAdminId,
        status: 'BLOCKED',
        start_ts: start_ts,
        end_ts: end_ts,
        title: title || 'Blocked Dates',
        notes: notes || 'Admin blocked these dates',
        bedroom_count: bedroom_count
      })
      .select('*')
      .single();

    if (bookingError) {
      console.error('Database error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to block dates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      booking: blockedBooking,
      message: 'Dates blocked successfully'
    });
  } catch (error) {
    console.error('Block dates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
