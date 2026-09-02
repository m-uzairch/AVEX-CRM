/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { loginSchema } from '@/features/auth/schemas/auth-schemas';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';
import { verifyPassword } from '@/lib/auth/password';
import { UserRole } from '@/features/rbac/types/rbac-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const email = validated.email.trim().toLowerCase();
    const password = validated.password;

    if (!password) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const db = prisma as any;
    let userRecord: any = null;
    let userRole: UserRole = 'COMPANY_OWNER';
    let companyId = 'comp_001';
    let companyName = 'AVEX CRM Technologies Inc.';
    let businessType = 'DIGITAL';
    let fullName = '';
    let isEmailVerified = true;

    // 1. If Supabase authenticated this user client-side (Supabase Auth verified credentials)
    if (body.supabaseUser) {
      const su = body.supabaseUser;
      fullName = su.user_metadata?.full_name || su.email?.split('@')[0] || 'Company Admin';
      companyName = su.user_metadata?.company_name || 'My Workspace';
      businessType = su.user_metadata?.business_type || 'DIGITAL';
      const assignedRole = (su.user_metadata?.role as UserRole) || 'COMPANY_OWNER';
      const userId = su.id || `usr_${Date.now()}`;
      companyId = `comp_${userId.substring(0, 8)}`;

      // Register or update in AuthUserStore
      const registered = AuthUserStore.registerOrUpdateUser({
        id: userId,
        email,
        fullName,
        role: assignedRole,
        companyId,
        companyName,
        businessType,
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: su.created_at || new Date().toISOString(),
        password, // stores hashed
      });

      const response = NextResponse.json({
        user: {
          id: userId,
          supabaseUserId: userId,
          email,
          fullName,
          companyId,
          companyName,
          businessType,
          role: registered.role,
          isEmailVerified: true,
          createdAt: registered.createdAt,
        },
      });

      response.cookies.set('auth_session', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('user_role', registered.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 2. First check Prisma DB if available
    try {
      if (db.user?.findFirst) {
        const dbUser = await db.user.findFirst({
          where: { email },
          include: {
            company: true,
            userRoles: { include: { role: true } },
          },
        });

        if (dbUser) {
          userRecord = dbUser;
          fullName = dbUser.fullName;
          companyId = dbUser.companyId || dbUser.company?.id || 'comp_001';
          companyName = dbUser.company?.name || 'AVEX CRM Technologies Inc.';
          businessType = dbUser.company?.businessType || 'DIGITAL';
          userRole = (dbUser.userRoles?.[0]?.role?.name as UserRole) || 'COMPANY_OWNER';
          isEmailVerified = dbUser.status === 'ACTIVE';
        }
      }
    } catch {
      // DB lookup fallback
    }

    // 3. Check AuthUserStore
    const memoryUser = AuthUserStore.findUserByEmail(email);

    if (!userRecord && !memoryUser) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Verify Password against stored hash
    const storedHash = memoryUser?.passwordHash || (userRecord as any)?.passwordHash;

    if (!storedHash) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isPasswordValid = verifyPassword(password, storedHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (memoryUser) {
      fullName = memoryUser.fullName;
      companyId = memoryUser.companyId;
      companyName = memoryUser.companyName;
      businessType = memoryUser.businessType;
      userRole = memoryUser.role;
      isEmailVerified = memoryUser.isEmailVerified;
    }

    const userId = userRecord?.id || memoryUser?.id || `usr_${Date.now()}`;

    // 4. Return authenticated user profile and set session cookie
    const response = NextResponse.json({
      user: {
        id: userId,
        supabaseUserId: userId,
        email,
        fullName,
        companyId,
        companyName,
        businessType,
        role: userRole,
        isEmailVerified,
        createdAt: memoryUser?.createdAt || new Date().toISOString(),
      },
    });

    response.cookies.set('auth_session', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('user_role', userRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('[API POST /api/auth/login] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed.' },
      { status: 400 }
    );
  }
}
