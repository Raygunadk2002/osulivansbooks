import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // Redirect to home page with the code as a query parameter
    // The client-side will handle the session exchange
    return NextResponse.redirect(`${origin}${next}?code=${code}`);
  }

  // Return the user to the home page if there's an error
  return NextResponse.redirect(`${origin}/`);
}
