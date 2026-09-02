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
  '/finance',
  '/payments',
  '/expenses',
  '/financial-dashboard',
  '/inventory',
  '/reports',
  '/calendar',
  '/notifications',
  '/settings',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Execute Supabase SSR session token update and fetch authenticated user
  const { supabaseResponse, user } = await updateSession(request);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const authSession = request.cookies.get('auth_session')?.value;
  const isAuthenticated = Boolean(user) || Boolean(authSession);
  const clientSession = request.cookies.get('client_session')?.value;
  const isPortalRoute = pathname === '/portal' || pathname.startsWith('/portal/');
  const isPortalLogin = pathname === '/portal/login';

  // 1. Internal CRM protected routes (/dashboard, /settings, etc.)
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Client Portal protected routes (/portal, /portal/projects, etc. EXCEPT /portal/login)
  if (isPortalRoute && !isPortalLogin) {
    if (!clientSession) {
      const portalLoginUrl = new URL('/portal/login', request.url);
      portalLoginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(portalLoginUrl);
    }
  }

  // 3. Root URL (/)
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (clientSession) {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Never redirect away from login routes (/login, /register, /portal/login).
  // Users must always be able to access login pages to authenticate or switch accounts.
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
