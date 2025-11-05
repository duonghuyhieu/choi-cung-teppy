import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/db/users';
import { findUserByUsername } from '@/lib/db/users-helpers';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { LoginDto, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginDto = await request.json();

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

    // Find user
    const user = await findUserByUsername(body.username);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      body.password,
      (user as any).password_hash
    );

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    // Create session token
    const token = createSession(user);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user as any;

    const responseData: AuthResponse = {
      user: userWithoutPassword,
      token,
    };

    // Create cookie string
    const cookieValue = `game-saver-session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;

    console.log('Setting cookie:', cookieValue);

    // Create response with Set-Cookie header
    const response = NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: responseData,
        message: 'Login successful',
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookieValue,
        }
      }
    );

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to login',
      },
      { status: 500 }
    );
  }
}
