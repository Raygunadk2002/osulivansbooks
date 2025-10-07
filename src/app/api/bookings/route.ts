import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // Get all bookings ordered by start date
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('start_ts', { ascending: true });

    if (bookingsError) {
      console.error('Database error:', bookingsError);
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
