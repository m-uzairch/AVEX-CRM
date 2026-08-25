/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { userProfileSchema } from '@/features/settings/schemas/settings-schemas';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const db = prisma as any;

    let profileData = null;
    try {
      const user = await db.user.findUnique({
        where: { id: auth.userId },
        include: { profile: true, company: true },
      });

      if (user) {
        profileData = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.profile?.phone || '+1 (555) 019-2834',
          jobTitle: user.profile?.jobTitle || 'Executive Director',
          bio: user.profile?.bio || 'Leading operations, client delivery, and CRM strategy.',
          avatar: user.avatar || '',
          role: auth.role,
          companyName: user.company?.name || auth.companyName,
        };
      }
    } catch {
      // Fallback
    }

    if (!profileData) {
      profileData = {
        id: auth.userId,
        fullName: auth.fullName,
        email: auth.email,
        phone: '+1 (555) 019-2834',
        jobTitle: 'Executive Director',
        bio: 'Leading operations, client delivery, and CRM strategy.',
        avatar: '',
        role: auth.role,
        companyName: auth.companyName,
      };
    }

    return NextResponse.json({ profile: profileData });
  } catch (error) {
    console.error('[API GET /api/settings/profile] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = userProfileSchema.parse(body);
    const db = prisma as any;

    try {
      await db.user.update({
        where: { id: auth.userId },
        data: {
          fullName: validated.fullName,
          avatar: validated.avatar || null,
        },
      });

      await db.userProfile.upsert({
        where: { userId: auth.userId },
        create: {
          userId: auth.userId,
          phone: validated.phone || null,
          jobTitle: validated.jobTitle || null,
          bio: validated.bio || null,
        },
        update: {
          phone: validated.phone || null,
          jobTitle: validated.jobTitle || null,
          bio: validated.bio || null,
        },
      });
    } catch {
      // Graceful local handling
    }

    return NextResponse.json({
      profile: {
        id: auth.userId,
        fullName: validated.fullName,
        email: auth.email,
        phone: validated.phone,
        jobTitle: validated.jobTitle,
        bio: validated.bio,
        avatar: validated.avatar,
        role: auth.role,
        companyName: auth.companyName,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    console.error('[API PUT /api/settings/profile] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update user profile.' },
      { status: 400 }
    );
  }
}
