import { NextRequest, NextResponse } from 'next/server';

// Mock users array - in a real app, this would be a database
let users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // In a real app, store hashed passwords
    role: 'admin'
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Helper function to add CORS headers to all responses
function corsResponse(body: any, status = 200) {
  const response = NextResponse.json(body, { status });
  
  // Essential CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  return response;
}

// Handle OPTIONS request (preflight)
export async function OPTIONS() {
  return corsResponse({}, 204);
}

export async function POST(request: NextRequest) {
  console.log("AUTH REGISTER POST endpoint called");
  
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return corsResponse(
        { message: 'Name, email and password are required' },
        400
      );
    }

    // Check if user already exists
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return corsResponse(
        { message: 'Email already in use' },
        409
      );
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password, // In a real app, hash the password
      role: 'user' // Default role for new registrations
    };

    // Add to "database"
    users.push(newUser);

    // Generate JWT token
    const token = Buffer.from(
      JSON.stringify({ id: newUser.id, email: newUser.email })
    ).toString('base64');

    // Return user info and token (exclude password)
    const { password: _, ...userWithoutPassword } = newUser;

    return corsResponse({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return corsResponse(
      { message: 'Internal server error' },
      500
    );
  }
}
