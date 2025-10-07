import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Use service role client for ICS generation
    const supabase = createServiceRoleClient();

    // Validate token against settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('ics_token, house_name')
      .single();

    if (settingsError || !settings || settings.ics_token !== token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get approved bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        title,
        start_ts,
        end_ts,
        status
      `)
      .eq('status', 'APPROVED')
      .order('start_ts', { ascending: true });

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Generate ICS content
    const icsContent = generateICS(bookings, settings.house_name);

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${settings.house_name.replace(/\s+/g, '_')}_bookings.ics"`
      }
    });
  } catch (error) {
    console.error('ICS generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateICS(bookings: Array<{id: string, title: string, start_ts: string, end_ts: string, status: string}>, houseName: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//O\'Sullivan House//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${houseName} Bookings`,
    `X-WR-CALDESC:Approved bookings for ${houseName}`,
    ''
  ];

  bookings.forEach((booking, index) => {
    const startDate = formatDateForICS(booking.start_ts);
    const endDate = formatDateForICS(booking.end_ts);
    const title = booking.title || `Booking by ${booking.profiles?.display_name || 'Unknown'}`;
    const uid = `booking-${index}-${Date.now()}@osullivanshouse.com`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:Booking at ${houseName}`,
      `DTSTAMP:${now}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}

function formatDateForICS(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
