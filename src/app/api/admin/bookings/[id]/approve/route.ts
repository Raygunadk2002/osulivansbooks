import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
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

    // Update booking status to APPROVED
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'APPROVED' })
      .eq('id', id)
      .eq('status', 'PENDING')
      .select()
      .single();

    if (bookingError) {
      // Check if it's a constraint violation (overlapping booking)
      if (bookingError.code === '23514') {
        return NextResponse.json(
          { error: 'This booking conflicts with an existing approved booking' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to approve booking' },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or not pending' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Approve booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
