import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const protectedRoutes = [
  '/dashboard',
  '/crm',
  '/projects',
  '/employees',
  '/attendance',
  '/quotations',
  '/invoices',
  '/payments',
  '/expenses',
  '/financial-dashboard',
  '/inventory',
  '/reports',
  '/calendar',
  '/notifications',
  '/settings',
];

const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Execute Supabase SSR session token update and fetch authenticated user
  const { supabaseResponse, user } = await updateSession(request);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Authenticated state is determined by valid Supabase SSR user session
  const isAuthenticated = Boolean(user);

  // 1. If unauthenticated user tries to access protected route -> redirect to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated user tries to access /login, /register, or /, redirect to /dashboard
  if (isAuthenticated && (isAuthRoute || pathname === '/')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
