import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { generateSecurePassword } from '@/lib/password-generator';
import { sendWelcomeEmail } from '@/lib/email-service';

// GET - List all users with their profiles and roles
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    // Get all users with their profiles and member roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Profiles error:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*');

    if (membersError) {
      console.error('Members error:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    // Combine profiles with their member data
    const users = (profiles || []).map(profile => ({
      ...profile,
      members: (members || []).filter(member => member.user_id === profile.user_id)
    }));

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const { email, display_name, role = 'MEMBER' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    let userId;
    
    // Generate a secure password for the new user
    const generatedPassword = generateSecurePassword(12);
    
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create user in auth system with generated password
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          display_name: display_name || email.split('@')[0]
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        return NextResponse.json(
          { error: `Failed to create user: ${authError.message}` },
          { status: 400 }
        );
      }

      userId = authUser.user.id;
    }

    // Create or update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        email: email,
        display_name: display_name || email.split('@')[0]
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Create or update member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .upsert({
        user_id: userId,
        role: role
      })
      .select()
      .single();

    if (memberError) {
      console.error('Member creation error:', memberError);
      return NextResponse.json(
        { error: `Failed to create member record: ${memberError.message}` },
        { status: 500 }
      );
    }

    // Send welcome email with credentials (only for new users)
    let emailSent = false;
    let emailError = null;
    
    if (!existingUser) {
      const emailResult = await sendWelcomeEmail(
        display_name || email.split('@')[0],
        email,
        generatedPassword
      );
      
      emailSent = emailResult.success;
      emailError = emailResult.error;
    }

    return NextResponse.json({
      user: {
        ...profile,
        members: [member]
      },
      password: !existingUser ? generatedPassword : null,
      emailSent: emailSent,
      emailError: emailError,
      message: existingUser 
        ? 'User updated successfully' 
        : 'User created successfully' + (emailSent ? ' and welcome email sent' : '')
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
