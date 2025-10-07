import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching photos:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch photos',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({ photos: photos || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    // Use an existing user ID from the database
    const mockUserId = '342575fd-ad57-4553-8a2c-1a8170aab430'; // Test Member user ID
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const displayName = formData.get('displayName') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 });
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `photo_${timestamp}.${fileExtension}`;
    const filePath = `photos/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file to storage',
        details: uploadError.message 
      }, { status: 500 });
    }
    
    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData.publicUrl;
    
    // Store metadata in database
    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        user_id: mockUserId,
        display_name: displayName || 'Test Member',
        title: title || 'Untitled Photo',
        description: description || '',
        file_path: publicUrl, // Store the public URL instead of local path
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving photo metadata:', error);
      return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      photo,
      message: 'Photo uploaded successfully' 
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
