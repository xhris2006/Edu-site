// src/middleware.ts — Route protection middleware
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/generate', '/history', '/favorites', '/trends', '/pricing', '/settings', '/admin']
// Routes that redirect if already logged in
const AUTH_ROUTES = ['/auth/login', '/auth/register']
// Admin-only routes
const ADMIN_ROUTES = ['/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('creatorzap_token')?.value

  // Check if route needs protection
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  const isApiRoute = pathname.startsWith('/api')

  // Skip middleware for non-relevant routes
  if (!isProtected && !isAuthRoute) return NextResponse.next()

  // Verify token
  const payload = token ? await verifyToken(token) : null

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !payload) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect admin routes
  if (isAdminRoute && payload?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard?error=forbidden', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/history/:path*',
    '/favorites/:path*',
    '/trends/:path*',
    '/pricing/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
}
