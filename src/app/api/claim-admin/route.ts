import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { claimCode } = await request.json();

    if (!claimCode) {
      return NextResponse.json(
        { error: 'Admin claim code is required' },
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

    // Check if the admin claim code matches
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('admin_claim_code')
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 500 }
      );
    }

    if (settings.admin_claim_code !== claimCode) {
      return NextResponse.json(
        { error: 'Invalid admin claim code' },
        { status: 400 }
      );
    }

    // Upsert the user as an admin
    const { error: memberError } = await supabase
      .from('members')
      .upsert({
        user_id: user.id,
        role: 'ADMIN'
      });

    if (memberError) {
      return NextResponse.json(
        { error: 'Failed to claim admin role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Claim admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
