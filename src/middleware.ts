import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configure which paths should be handled by this middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};

export function middleware(request: NextRequest) {
  // Early return for non-CORS routes like static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/static/') ||
    request.nextUrl.pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  console.log(`Middleware handling request to: ${request.nextUrl.pathname}`);

  // Handle OPTIONS preflight request
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new NextResponse(null, {
      status: 204, // No content
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // For actual requests, add CORS headers to response
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  );

  return response;
}
