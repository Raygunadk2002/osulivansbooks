#!/usr/bin/env node

/**
 * Script to help you get your Supabase credentials
 * Run with: node scripts/get-supabase-keys.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Supabase Credentials Helper');
console.log('==============================');
console.log('');
console.log('This script will help you get your Supabase credentials for Vercel deployment.');
console.log('');

const questions = [
  {
    question: '1. Go to your Supabase project dashboard',
    instruction: '   - Visit https://supabase.com/dashboard'
  },
  {
    question: '2. Go to Settings > API',
    instruction: '   - Click on "Settings" in the left sidebar'
  },
  {
    question: '3. Copy your Project URL',
    instruction: '   - Look for "Project URL" (starts with https://)'
  },
  {
    question: '4. Copy your anon/public key',
    instruction: '   - Look for "anon public" key (long string starting with eyJ)'
  },
  {
    question: '5. Copy your service_role key',
    instruction: '   - Look for "service_role" key (long string starting with eyJ)'
  }
];

questions.forEach((q, index) => {
  console.log(`${q.question}`);
  console.log(`${q.instruction}`);
  console.log('');
});

console.log('📋 Environment Variables for Vercel:');
console.log('=====================================');
console.log('');
console.log('Add these to your Vercel project settings:');
console.log('');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
console.log('');
console.log('🔒 Security Note:');
console.log('- The service_role key is sensitive - keep it secret');
console.log('- Only add it to Vercel environment variables');
console.log('- Never commit it to your Git repository');
console.log('');

rl.question('Press Enter when you have your credentials ready...', () => {
  console.log('');
  console.log('✅ Next Steps:');
  console.log('1. Go to your Vercel project settings');
  console.log('2. Add the environment variables above');
  console.log('3. Redeploy your project');
  console.log('4. Test your deployment');
  console.log('');
  console.log('🚀 Your app should now work with Supabase!');
  rl.close();
});
