import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { joinCode } = await request.json();

    if (!joinCode) {
      return NextResponse.json(
        { error: 'Join code is required' },
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

    // Check if the join code matches
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('join_code')
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 500 }
      );
    }

    if (settings.join_code !== joinCode) {
      return NextResponse.json(
        { error: 'Invalid join code' },
        { status: 400 }
      );
    }

    // Upsert the user as a member
    const { error: memberError } = await supabase
      .from('members')
      .upsert({
        user_id: user.id,
        role: 'MEMBER'
      });

    if (memberError) {
      return NextResponse.json(
        { error: 'Failed to join house' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Join error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
