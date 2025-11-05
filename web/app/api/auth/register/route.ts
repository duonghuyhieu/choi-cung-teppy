import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db/users';
import { findUserByUsername } from '@/lib/db/users-helpers';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { CreateUserDto, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserDto = await request.json();

    // Validate input
    if (!body.username || !body.password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Username and password are required',
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(body.username);
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Username already in use',
        },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(body);

    // Create session token
    const token = createSession(user);

    // Set cookie
    await setSessionCookie(token);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user as any;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token,
    };

    return NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: response,
        message: 'User registered successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to register user',
      },
      { status: 500 }
    );
  }
}
