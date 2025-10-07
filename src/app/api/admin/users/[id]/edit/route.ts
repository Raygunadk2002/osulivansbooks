import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { display_name, email } = await request.json();
    const supabase = createServiceRoleClient();

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: display_name,
        email: email
      })
      .eq('user_id', id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Update auth user email if it changed
    if (email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email: email,
        user_metadata: {
          display_name: display_name || email.split('@')[0]
        }
      });

      if (authError) {
        console.error('Auth user update error:', authError);
        // Don't fail the request if auth update fails, profile was updated
      }
    }

    return NextResponse.json({
      profile: profile,
      message: 'Member details updated successfully'
    });
  } catch (error) {
    console.error('Edit member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
