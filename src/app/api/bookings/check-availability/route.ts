import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { start_ts, end_ts, bedroom_count } = await request.json();

    if (!start_ts || !end_ts || !bedroom_count) {
      return NextResponse.json(
        { error: 'Start date, end date, and bedroom count are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get total bedrooms already booked for the time period
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('bedroom_count')
      .in('status', ['APPROVED', 'HOLD', 'BLOCKED'])
      .gte('end_ts', start_ts)
      .lte('start_ts', end_ts);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    // Calculate total bedrooms already booked
    const totalBookedBedrooms = existingBookings?.reduce((sum, booking) => {
      return sum + (booking.bedroom_count || 1);
    }, 0) || 0;

    // Check if this booking would exceed capacity
    const wouldExceedCapacity = (totalBookedBedrooms + bedroom_count) > 4;
    const availableBedrooms = Math.max(0, 4 - totalBookedBedrooms);

    return NextResponse.json({
      available: !wouldExceedCapacity,
      totalBookedBedrooms,
      requestedBedrooms: bedroom_count,
      availableBedrooms,
      wouldExceedCapacity,
      existingBookings: existingBookings?.length || 0
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
