export async function GET() {
  return Response.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasTimezone: !!process.env.DEFAULT_TIMEZONE
    }
  });
}
