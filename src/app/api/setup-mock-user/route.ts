import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Create a mock user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: mockUserId,
        email: 'alexkeal@me.com',
        display_name: 'Alex Keal'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json({
        success: false,
        error: profileError.message,
        code: profileError.code
      });
    }

    // Create a mock member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .upsert({
        user_id: mockUserId,
        role: 'MEMBER'
      })
      .select()
      .single();

    if (memberError) {
      console.error('Member creation error:', memberError);
      return NextResponse.json({
        success: false,
        error: memberError.message,
        code: memberError.code
      });
    }

    return NextResponse.json({
      success: true,
      profile: profile,
      member: member,
      message: 'Mock user setup successfully!'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
