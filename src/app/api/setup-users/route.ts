import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createServiceRoleClient();
    
    // Create mock users for development
    const mockUsers = [
      {
        id: 'mock-user-id',
        email: 'user@osullivanhouse.com',
        display_name: 'Test User'
      },
      {
        id: 'mock-admin-id', 
        email: 'admin@osullivanhouse.com',
        display_name: 'Test Admin'
      }
    ];
    
    const results = [];
    
    for (const user of mockUsers) {
      // Insert into profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
        results.push({ user: user.email, status: 'error', error: profileError.message });
        continue;
      }
      
      // Insert into members table
      const { data: member, error: memberError } = await supabase
        .from('members')
        .upsert({
          user_id: user.id,
          role: user.email.includes('admin') ? 'ADMIN' : 'MEMBER',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (memberError) {
        console.error(`Error creating member for ${user.email}:`, memberError);
        results.push({ user: user.email, status: 'error', error: memberError.message });
        continue;
      }
      
      results.push({ 
        user: user.email, 
        status: 'success', 
        profile: profile,
        member: member 
      });
    }
    
    return NextResponse.json({
      message: 'Mock users setup completed',
      results: results
    });
    
  } catch (error) {
    console.error('Setup users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
