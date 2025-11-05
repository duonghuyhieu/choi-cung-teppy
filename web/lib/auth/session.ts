import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const COOKIE_NAME = 'game-saver-session';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
}

// Create session token
export function createSession(user: User): string {
  const sessionData: SessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(sessionData, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

// Verify and decode session token
export function verifySession(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Get current session from cookies (server-side)
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

// Set session cookie (server-side)
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear session cookie (server-side)
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'admin';
}

// Require authentication (throws if not authenticated)
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

// Require admin role (throws if not admin)
export async function requireAdmin(): Promise<SessionData> {
  const session = await requireAuth();

  if (session.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}
