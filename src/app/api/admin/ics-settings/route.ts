import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // Get ICS settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('ics_token, house_name')
      .single();

    if (settingsError) {
      console.error('Settings error:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ics_token: settings?.ics_token,
      house_name: settings?.house_name
    });
  } catch (error) {
    console.error('Get ICS settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
