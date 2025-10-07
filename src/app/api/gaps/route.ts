import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { calculateGaps } from '@/lib/gaps';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const minNights = parseInt(searchParams.get('minNights') || '1');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to parameters are required' },
        { status: 400 }
      );
    }

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

    // Get settings for buffer days
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('buffer_days')
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 500 }
      );
    }

    // Get booked ranges (APPROVED, HOLD, BLOCKED)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_ts, end_ts')
      .in('status', ['APPROVED', 'HOLD', 'BLOCKED'])
      .gte('end_ts', from)
      .lte('start_ts', to);

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Convert to TimeRange format
    const bookedRanges = bookings.map(booking => ({
      start: new Date(booking.start_ts),
      end: new Date(booking.end_ts)
    }));

    // Calculate gaps
    const gaps = calculateGaps(
      bookedRanges,
      new Date(from),
      new Date(to),
      minNights,
      settings.buffer_days
    );

    return NextResponse.json({ gaps });
  } catch (error) {
    console.error('Get gaps error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
