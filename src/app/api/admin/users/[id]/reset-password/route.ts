import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { generateSecurePassword } from '@/lib/password-generator';
import { sendWelcomeEmail } from '@/lib/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServiceRoleClient();

    // Get user profile to get email and display name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('user_id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new password
    const newPassword = generateSecurePassword(12);

    // Update user password in auth system
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword
    });

    if (authError) {
      console.error('Password update error:', authError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Send password reset email
    const emailResult = await sendWelcomeEmail(
      profile.display_name || profile.email.split('@')[0],
      profile.email,
      newPassword,
      'O\'Sullivan House - Password Reset'
    );

    return NextResponse.json({
      password: newPassword,
      emailSent: emailResult.success,
      emailError: emailResult.error,
      message: 'Password reset successfully' + (emailResult.success ? ' and email sent' : '')
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
