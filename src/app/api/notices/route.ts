import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

// GET - List all notices
export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // Get all notices
    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notices' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notices: notices || [] });
  } catch (error) {
    console.error('Get notices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new notice
export async function POST(request: NextRequest) {
  try {
    const { title, body } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // For development, use an existing user ID
    const mockUserId = '20aaec78-62b1-4fde-bd31-2351fb97caeb';

    // Create the notice
    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        author_id: mockUserId,
        title: title,
        body: body,
        pinned: false
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create notice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notice: notice,
      message: 'Notice created successfully'
    });
  } catch (error) {
    console.error('Create notice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}