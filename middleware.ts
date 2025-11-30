import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes for each role
const studentRoutes = ['/students', '/student']
const teacherRoutes = ['/teacher']
const instituteRoutes = ['/institute']

// Define auth routes (redirect to dashboard if already logged in)
const authRoutes = ['/sign-in', '/sign-up']

// Routes that don't require email verification check
const publicRoutes = ['/', '/verify-email', '/select-role', '/forgot-password', '/reset-password', '/verify-reset']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip verification check for public routes and API routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Check if the route requires authentication
  const isStudentRoute = studentRoutes.some(route => pathname.startsWith(route))
  const isTeacherRoute = teacherRoutes.some(route => pathname.startsWith(route))
  const isInstituteRoute = instituteRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = isStudentRoute || isTeacherRoute || isInstituteRoute

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Get session cookie (try multiple possible cookie names)
  const sessionToken = request.cookies.get('better-auth.session_token')?.value || 
                      request.cookies.get('better-auth.session-token')?.value ||
                      request.cookies.get('session_token')?.value

  console.log('Middleware Debug:', {
    pathname,
    sessionToken: !!sessionToken,
    isProtectedRoute,
    isStudentRoute,
    isTeacherRoute,
    isInstituteRoute,
    cookies: request.cookies.getAll().map(c => c.name)
  })

  // Redirect to sign-in if accessing protected route without session
  if (isProtectedRoute && !sessionToken) {
    console.log('Redirecting to sign-in: no session token')
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // For protected routes with session, add header to check verification on the page
  if (sessionToken && isProtectedRoute) {
    const response = NextResponse.next()
    response.headers.set('x-check-verification', 'true')
    return response
  }

  // If authenticated and accessing auth routes, redirect to students by default
  // The actual verification check will happen client-side
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/students', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*|_next).*)',
  ],
}
