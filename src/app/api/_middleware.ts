import { NextRequest, NextResponse } from 'next/server';

// Mock function to verify token - in a real app, use proper JWT verification
const verifyToken = (token: string) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return {
      isValid: true,
      userId: decoded.id,
    };
  } catch (error) {
    return {
      isValid: false,
      userId: null,
    };
  }
};

// List of public routes that don't require authentication
const publicRoutes = ['/api/auth/login', '/api/auth/register'];

// Helper function to add CORS headers to a response
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function authMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const pathname = request.nextUrl.pathname;

  // Handle CORS preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const response = NextResponse.json({}, { status: 200 });
    return addCorsHeaders(response);
  }

  // Allow public routes without authentication
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    const response = await handler(request);
    return addCorsHeaders(response);
  }

  // Check for authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response = NextResponse.json(
      { message: 'Unauthorized: Missing or invalid token' },
      { status: 401 }
    );
    return addCorsHeaders(response);
  }

  // Extract and verify token
  const token = authHeader.split(' ')[1];
  const { isValid, userId } = verifyToken(token);

  if (!isValid) {
    const response = NextResponse.json(
      { message: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
    return addCorsHeaders(response);
  }

  // Add user ID to request for use in route handlers
  const requestWithUser = new NextRequest(request);
  requestWithUser.headers.set('X-User-ID', userId);

  const response = await handler(requestWithUser);
  return addCorsHeaders(response);
}
