import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServiceRoleClient();

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status: 'APPROVED' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to approve booking' },
        { status: 500 }
      );
    }

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      booking: updatedBooking,
      message: 'Booking approved successfully'
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
