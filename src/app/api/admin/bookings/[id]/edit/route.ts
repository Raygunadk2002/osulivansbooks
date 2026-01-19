import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, notes, bedroom_count, status, start_ts, end_ts } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get the existing booking first
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Build the update object with only provided fields
    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (notes !== undefined) updateData.notes = notes;
    if (bedroom_count !== undefined) updateData.bedroom_count = bedroom_count;
    if (status !== undefined) updateData.status = status;
    if (start_ts !== undefined) updateData.start_ts = start_ts;
    if (end_ts !== undefined) updateData.end_ts = end_ts;

    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      
      // Check for overlap constraint violation
      if (updateError.code === '23P01' || updateError.message?.includes('no_overlapping_bookings')) {
        return NextResponse.json(
          { error: 'These dates conflict with another approved/hold/blocked booking' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to update booking: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Edit booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
