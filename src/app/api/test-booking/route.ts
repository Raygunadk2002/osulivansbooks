import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createServiceRoleClient();
    
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...');
    
    // Test 2: Check if mock user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'mock-user-id')
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({
        success: false,
        error: 'Mock user profile not found',
        details: profileError.message,
        suggestion: 'Run /api/setup-users first'
      });
    }
    
    // Test 3: Check if member record exists
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', 'mock-user-id')
      .single();
    
    if (memberError) {
      console.error('Member error:', memberError);
      return NextResponse.json({
        success: false,
        error: 'Mock user member record not found',
        details: memberError.message,
        suggestion: 'Run /api/setup-users first'
      });
    }
    
    // Test 4: Try to create a test booking
    const testStartDate = new Date();
    testStartDate.setDate(testStartDate.getDate() + 1);
    const testEndDate = new Date();
    testEndDate.setDate(testEndDate.getDate() + 2);
    
    const { data: testBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        requester_id: 'mock-user-id',
        status: 'PENDING',
        start_ts: testStartDate.toISOString(),
        end_ts: testEndDate.toISOString(),
        title: 'Test Booking',
        notes: 'This is a test booking',
        bedroom_count: 1
      })
      .select()
      .single();
    
    if (bookingError) {
      console.error('Booking test error:', bookingError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create test booking',
        details: bookingError.message,
        code: bookingError.code,
        hint: bookingError.hint
      });
    }
    
    // Clean up test booking
    await supabase
      .from('bookings')
      .delete()
      .eq('id', testBooking.id);
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed! Booking creation should work.',
      profile: profile,
      member: member,
      testBooking: testBooking
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during testing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
