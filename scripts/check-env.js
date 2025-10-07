// Script to check environment variables
console.log('=== Environment Variables Check ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('DEFAULT_TIMEZONE:', process.env.DEFAULT_TIMEZONE ? '✅ Set' : '❌ Missing');

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('\n=== Current Values ===');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Anon Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  console.log('Service Role Key (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');
  console.log('Timezone:', process.env.DEFAULT_TIMEZONE);
}
