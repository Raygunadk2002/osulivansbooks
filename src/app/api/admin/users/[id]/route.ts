import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

// GET - Get detailed member information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();

    // Get member profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get member role
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member record not found' },
        { status: 404 }
      );
    }

    // Get user's bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('requester_id', id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError);
      // Don't fail the request if bookings can't be fetched
    }

    // Get user's notices (if they created any)
    const { data: notices, error: noticesError } = await supabase
      .from('notices')
      .select('*')
      .eq('author_id', id)
      .order('created_at', { ascending: false });

    if (noticesError) {
      console.error('Notices fetch error:', noticesError);
      // Don't fail the request if notices can't be fetched
    }

    return NextResponse.json({
      profile: profile,
      member: member,
      bookings: bookings || [],
      notices: notices || [],
      stats: {
        totalBookings: bookings?.length || 0,
        totalNotices: notices?.length || 0,
        memberSince: member.created_at
      }
    });
  } catch (error) {
    console.error('Get member details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();

    // First, get the user details for logging
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

    // Delete from members table first due to foreign key constraints
    const { error: memberError } = await supabase
      .from('members')
      .delete()
      .eq('user_id', id);

    if (memberError) {
      console.error('Delete member error:', memberError);
      return NextResponse.json(
        { error: 'Failed to delete member record' },
        { status: 500 }
      );
    }

    // Then delete from profiles table
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', id);

    if (profileDeleteError) {
      console.error('Delete profile error:', profileDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user profile' },
        { status: 500 }
      );
    }

    // Finally, delete the user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Delete auth user error:', authError);
      return NextResponse.json(
        { error: 'Failed to delete user from authentication system' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: `User ${profile.email} deleted successfully`,
      deletedUser: {
        id: id,
        email: profile.email,
        display_name: profile.display_name
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}