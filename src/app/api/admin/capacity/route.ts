import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    // Get current date for checking active bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get all bookings with their bedroom counts
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, status, start_ts, end_ts, bedroom_count, title, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Calculate total active bedrooms for TODAY only (APPROVED, HOLD, BLOCKED)
    const activeBedrooms = bookings?.reduce((total, booking) => {
      if (['APPROVED', 'HOLD', 'BLOCKED'].includes(booking.status)) {
        const startDate = new Date(booking.start_ts);
        const endDate = new Date(booking.end_ts);
        
        // Check if today falls within the booking period
        if (today >= startDate && today <= endDate) {
          return total + booking.bedroom_count;
        }
      }
      return total;
    }, 0) || 0;

    // Also calculate total active bedrooms across all dates for reference
    const totalActiveBedrooms = bookings?.reduce((total, booking) => {
      if (['APPROVED', 'HOLD', 'BLOCKED'].includes(booking.status)) {
        return total + booking.bedroom_count;
      }
      return total;
    }, 0) || 0;

    return NextResponse.json({
      activeBedrooms,
      maxBedrooms: 4,
      availableBedrooms: Math.max(0, 4 - activeBedrooms),
      totalBookings: bookings?.length || 0,
      totalActiveBedrooms, // For debugging
      currentDate: todayStr
    });
  } catch (error) {
    console.error('Get capacity info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
