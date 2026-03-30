// src/lib/auth.ts — JWT authentication utilities
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { JWTPayload } from '@/types'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'creatorzap-dev-secret-change-in-production'
)

const EXPIRY = '7d'

/** Sign a JWT token */
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
}

/** Verify and decode JWT token */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

/** Get current user from cookie in server component/route handler */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('creatorzap_token')?.value
  if (!token) return null
  return verifyToken(token)
}

/** Set auth cookie */
export function getAuthCookieOptions() {
  return {
    name: 'creatorzap_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}
