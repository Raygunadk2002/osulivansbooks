import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return Response.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data: data
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json({ 
      success: false, 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
