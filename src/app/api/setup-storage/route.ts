import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createServiceRoleClient();
    
    // Check if photos bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return NextResponse.json({
        success: false,
        error: 'Failed to list storage buckets',
        details: listError.message
      }, { status: 500 });
    }
    
    const photosBucket = buckets?.find(bucket => bucket.name === 'photos');
    
    if (photosBucket) {
      return NextResponse.json({
        success: true,
        message: 'Photos storage bucket already exists',
        bucket: photosBucket
      });
    }
    
    // Create photos bucket
    const { data: bucketData, error: createError } = await supabase.storage.createBucket('photos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create photos storage bucket',
        details: createError.message,
        hint: 'You may need to create the bucket manually in the Supabase dashboard'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Photos storage bucket created successfully',
      bucket: bucketData
    });
    
  } catch (error) {
    console.error('Setup storage error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during storage setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
