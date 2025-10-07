import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();
    
    // For now, we'll allow deletion without checking admin status
    // In production, you'd want to verify the user is an admin
    
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting photo:', error);
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Photo deleted successfully' });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
