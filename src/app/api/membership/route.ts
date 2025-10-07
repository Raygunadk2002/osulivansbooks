import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
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
      .select('user_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not a member' },
        { status: 404 }
      );
    }

    // Get settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('house_name, ics_token')
      .single();

    if (settingsError) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      member,
      settings 
    });
  } catch (error) {
    console.error('Get membership error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
