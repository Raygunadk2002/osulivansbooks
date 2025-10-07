import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('Supabase environment variables not found, using fallback');
    return createBrowserClient(
      'https://aojoxcwoudpvhdhhsdfb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvam94Y3dvdWRwdmhkaGhzZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU3NTksImV4cCI6MjA3NTIzMTc1OX0.gzLK-f1UT9wjHWISAO-4WjcX1_f3wKGpYFYBgwSLST0'
    );
  }
  
  return createBrowserClient(url, key);
}

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('Supabase environment variables not found, using fallback');
    return createBrowserClient(
      'https://aojoxcwoudpvhdhhsdfb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvam94Y3dvdWRwdmhkaGhzZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU3NTksImV4cCI6MjA3NTIzMTc1OX0.gzLK-f1UT9wjHWISAO-4WjcX1_f3wKGpYFYBgwSLST0'
    );
  }
  
  return createBrowserClient(url, key);
}

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.warn('Supabase service role environment variables not found, using fallback');
    return createSupabaseClient(
      'https://aojoxcwoudpvhdhhsdfb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvam94Y3dvdWRwdmhkaGhzZGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY1NTc1OSwiZXhwIjoyMDc1MjMxNzU5fQ.MmG40bMiDSXZIYq1cN7_tN7blInULZq3FYKlatN9odw'
    );
  }
  
  return createSupabaseClient(url, key);
}
