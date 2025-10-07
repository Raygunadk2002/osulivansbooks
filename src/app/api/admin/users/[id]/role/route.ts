import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

// PUT - Update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role } = await request.json();

    if (!role || !['MEMBER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role (MEMBER or ADMIN) is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update member role
    const { data: member, error } = await supabase
      .from('members')
      .update({ role: role })
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    if (!member) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      member: member,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
