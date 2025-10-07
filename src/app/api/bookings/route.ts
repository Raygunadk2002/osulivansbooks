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

    // Get all profiles to enrich booking data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, email');

    if (profilesError) {
      console.error('Profiles error:', profilesError);
      // Don't fail the request if profiles can't be fetched
    }

    // Enrich bookings with profile information
    const enrichedBookings = (bookings || []).map(booking => {
      const profile = profiles?.find(p => p.user_id === booking.requester_id);
      return {
        ...booking,
        profiles: profile ? {
          display_name: profile.display_name,
          email: profile.email
        } : null
      };
    });

    return NextResponse.json({ bookings: enrichedBookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
