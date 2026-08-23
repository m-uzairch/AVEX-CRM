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

  const isAuthenticated = Boolean(user);
  const clientSession = request.cookies.get('client_session')?.value;
  const isPortalRoute = pathname === '/portal' || pathname.startsWith('/portal/');
  const isPortalLogin = pathname === '/portal/login';

  // 1. If unauthenticated user tries to access internal protected route
  if (isProtectedRoute && !isAuthenticated && !clientSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If client session tries to access internal protected route -> redirect to /portal
  if (isProtectedRoute && clientSession && !isAuthenticated) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  // 3. If unauthenticated client tries to access protected portal route -> redirect to /portal/login
  if (isPortalRoute && !isPortalLogin && !clientSession && !isAuthenticated) {
    const portalLoginUrl = new URL('/portal/login', request.url);
    portalLoginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(portalLoginUrl);
  }

  // 4. If authenticated client visits /portal/login -> redirect to /portal
  if (isPortalLogin && (clientSession || isAuthenticated)) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  // 5. If authenticated user tries to access /login, /register, or /, redirect appropriately
  if (pathname === '/') {
    if (clientSession) {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
