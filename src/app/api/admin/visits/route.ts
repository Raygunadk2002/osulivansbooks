import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

// GET - List all visits
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    const { data: visits, error } = await supabase
      .from('visits')
      .select(`
        *,
        profiles!visits_author_id_fkey (
          display_name,
          email
        )
      `)
      .order('start_ts', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visits' },
        { status: 500 }
      );
    }

    return NextResponse.json({ visits: visits || [] });
  } catch (error) {
    console.error('Get visits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new visit
export async function POST(request: NextRequest) {
  try {
    const { start_ts, end_ts, title, notes, bedroom_count } = await request.json();

    if (!start_ts || !end_ts) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    if (!bedroom_count || bedroom_count < 1 || bedroom_count > 4) {
      return NextResponse.json(
        { error: 'Bedroom count must be between 1 and 4' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // For development, we'll use a real admin user ID
    // In production, this would come from the authenticated admin user
    const mockAdminId = '45df5c03-76bf-43e5-b379-e11d9d109a87'; // admin@example.com

    // Create the visit
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .insert({
        author_id: mockAdminId,
        start_ts: start_ts,
        end_ts: end_ts,
        title: title || 'House Visit',
        notes: notes || null,
        bedroom_count: bedroom_count
      })
      .select(`
        *,
        profiles!visits_author_id_fkey (
          display_name,
          email
        )
      `)
      .single();

    if (visitError) {
      console.error('Database error:', visitError);
      return NextResponse.json(
        { error: 'Failed to create visit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      visit: visit,
      message: 'Visit scheduled successfully'
    });
  } catch (error) {
    console.error('Create visit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
