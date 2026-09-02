/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { registerSchema } from '@/features/auth/schemas/auth-schemas';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const email = validated.email.trim().toLowerCase();
    const password = validated.password;

    // Check if account already exists
    const existing = AuthUserStore.findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const userId = body.supabaseUserId || `usr_${Date.now()}`;
    const companyId = `comp_${userId.substring(0, 8)}`;
    const passwordHash = hashPassword(password);

    // Save in AuthUserStore
    const userRecord = AuthUserStore.registerOrUpdateUser({
      id: userId,
      email,
      passwordHash,
      fullName: validated.fullName,
      role: 'COMPANY_OWNER',
      companyId,
      companyName: validated.companyName,
      businessType: validated.businessType,
      status: 'ACTIVE',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    });

    const db = prisma as any;
    try {
      if (db.company?.create) {
        await db.company.create({
          data: {
            id: companyId,
            name: validated.companyName,
            businessType: validated.businessType,
            status: 'ACTIVE',
          },
        });
      }

      if (db.user?.create) {
        await db.user.create({
          data: {
            id: userId,
            supabaseUserId: userId,
            email,
            fullName: validated.fullName,
            companyId,
            status: 'ACTIVE',
          },
        });
      }
    } catch {
      // DB create fallback
    }

    const company = {
      id: companyId,
      name: validated.companyName,
      businessType: validated.businessType,
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      user: {
        id: userId,
        supabaseUserId: userId,
        email,
        fullName: validated.fullName,
        companyId,
        companyName: validated.companyName,
        businessType: validated.businessType,
        role: 'COMPANY_OWNER',
        isEmailVerified: true,
        createdAt: userRecord.createdAt,
      },
      company,
      isConfirmed: true,
    });

    response.cookies.set('auth_session', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('user_role', 'COMPANY_OWNER', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('[API POST /api/auth/register] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register account.' },
      { status: 400 }
    );
  }
}
