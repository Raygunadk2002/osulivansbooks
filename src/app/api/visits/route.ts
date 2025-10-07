import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { toInstant } from '@/lib/gaps';

export async function GET(request: NextRequest) {
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

    // Check if user is a member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Membership required' },
        { status: 403 }
      );
    }

    // Get all visits ordered by start date
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select(`
        *,
        profiles!visits_created_by_fkey (
          display_name,
          email
        )
      `)
      .order('start_ts', { ascending: true });

    if (visitsError) {
      return NextResponse.json(
        { error: 'Failed to fetch visits' },
        { status: 500 }
      );
    }

    return NextResponse.json({ visits });
  } catch (error) {
    console.error('Get visits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, title, notes } = await request.json();

    if (!startDate || !endDate || !title) {
      return NextResponse.json(
        { error: 'Start date, end date, and title are required' },
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

    // Convert date-only inputs to UTC timestamps
    const startTs = toInstant(startDate);
    const endTs = toInstant(endDate);

    if (startTs >= endTs) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create the visit
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .insert({
        start_ts: startTs.toISOString(),
        end_ts: endTs.toISOString(),
        title: title,
        notes: notes || null,
        created_by: user.id
      })
      .select()
      .single();

    if (visitError) {
      return NextResponse.json(
        { error: 'Failed to create visit' },
        { status: 500 }
      );
    }

    return NextResponse.json({ visit });
  } catch (error) {
    console.error('Create visit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
