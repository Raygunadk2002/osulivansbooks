import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createServiceRoleClient();
    
    // Try to create a simple photos table first
    const { data, error } = await supabase
      .from('photos')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST205') {
      // Table doesn't exist, we need to create it
      return NextResponse.json({
        success: false,
        error: 'Photos table does not exist',
        message: 'The photos table needs to be created in the Supabase database. Please run the migration manually in the Supabase SQL editor.',
        migrationSQL: `
-- Create photos table for picture board
CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    title TEXT,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for photos
CREATE POLICY "Users can view all photos" ON photos
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert photos" ON photos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own photos" ON photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON photos
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all photos
CREATE POLICY "Admins can manage all photos" ON photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE user_id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
        `
      }, { status: 404 });
    }
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Error checking photos table',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Photos table exists and is accessible',
      photos: data || []
    });
    
  } catch (error) {
    console.error('Setup photos table error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
