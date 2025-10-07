import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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

    // Generate new ICS token
    const newToken = crypto.randomUUID();

    // Update settings with new token
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .update({ ics_token: newToken })
      .select('ics_token')
      .single();

    if (settingsError) {
      return NextResponse.json(
        { error: 'Failed to rotate ICS token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      newToken: settings.ics_token 
    });
  } catch (error) {
    console.error('Rotate ICS token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
