import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Check database connection
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed',
          error: error.message 
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
