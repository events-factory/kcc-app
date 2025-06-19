import { NextRequest, NextResponse } from 'next/server';

// Mock database for demo purposes - replace with real database in production
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // In a real app, store hashed passwords
    role: 'admin',
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  },
  {
    id: '3',
    name: 'KCC Admin',
    email: 'admin@kccevents.com',
    password: 'password123',
    role: 'admin',
  },
];

// This is necessary for preflight requests
export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });

  // Add CORS headers
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set(
    'Access-Control-Allow-Methods',
    'GET,DELETE,PATCH,POST,PUT,OPTIONS'
  );
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  );

  return res;
}

export async function POST(request: NextRequest) {
  console.log('AUTH LOGIN POST endpoint called');

  try {
    const body = await request.json();
    console.log('Login request body:', body);

    const { email, password } = body;

    // Validation
    if (!email || !password) {
      console.log('Missing email or password');
      const response = NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET,DELETE,PATCH,POST,PUT,OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      return response;
    }

    console.log('Available users:', users);

    // Find user (in a real app, query database)
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    console.log('Found user:', user);

    // Verify credentials
    if (!user) {
      console.log('User not found with email:', email);
      const response = NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET,DELETE,PATCH,POST,PUT,OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      return response;
    }

    // Compare passwords
    console.log('Password comparison:', {
      provided: password,
      expected: user.password,
      match: user.password === password,
    });

    if (user.password !== password) {
      console.log('Password mismatch for user:', email);
      const response = NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET,DELETE,PATCH,POST,PUT,OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      return response;
    }

    console.log('Authentication successful for user:', email);

    // Generate JWT token (in a real app, use proper JWT library)
    const token = Buffer.from(
      JSON.stringify({ id: user.id, email: user.email })
    ).toString('base64');

    // Return user info and token (exclude password)
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      user: userWithoutPassword,
      token,
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,DELETE,PATCH,POST,PUT,OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const response = NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,DELETE,PATCH,POST,PUT,OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    return response;
  }
}
