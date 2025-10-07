import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { toInstant } from '@/lib/gaps';

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, title } = await request.json();

    if (!startDate || !endDate || !title) {
      return NextResponse.json(
        { error: 'Start date, end date, and title are required' },
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

    // Check if user is an admin
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !member || member.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Convert date-only inputs to UTC timestamps
    const startTs = toInstant(startDate);
    const endTs = toInstant(endDate);

    if (startTs >= endTs) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create a blocked booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        requester_id: user.id,
        status: 'BLOCKED',
        start_ts: startTs.toISOString(),
        end_ts: endTs.toISOString(),
        title: title,
        notes: 'Admin-blocked period'
      })
      .select()
      .single();

    if (bookingError) {
      // Check if it's a constraint violation (overlapping booking)
      if (bookingError.code === '23514') {
        return NextResponse.json(
          { error: 'This period conflicts with an existing booking' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create blocked period' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Block period error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
