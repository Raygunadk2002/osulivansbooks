import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching photos:', error);
      return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
    }
    
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    // For now, we'll use a mock user ID since we're using hardcoded auth
    const mockUserId = 'mock-user-id';
    
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
    
    // For now, we'll store the file in the public directory
    // In production, you'd want to use a proper file storage service
    const filePath = `/uploads/photos/${fileName}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // In a real application, you'd upload to a storage service like AWS S3, Cloudinary, etc.
    // For now, we'll just store the metadata in the database
    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        user_id: mockUserId,
        display_name: displayName || 'Anonymous',
        title: title || 'Untitled Photo',
        description: description || '',
        file_path: filePath,
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
