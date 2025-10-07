import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    
    // Test if photos table exists
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Photos table error:', error);
      return NextResponse.json({
        success: false,
        error: 'Photos table issue',
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Photos table exists and is accessible',
      photos: photos || []
    });
    
  } catch (error) {
    console.error('Test photos error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
