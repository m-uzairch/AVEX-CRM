/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { projectCategoryFormSchema } from '@/features/projects/schemas/project-schemas';

const DEFAULT_CATEGORIES = [
  { name: 'Website Development', color: '#3B82F6', description: 'Web application & website projects' },
  { name: 'Mobile Application', color: '#8B5CF6', description: 'iOS & Android app development' },
  { name: 'CRM & Systems', color: '#EC4899', description: 'Customer relationship management platforms' },
  { name: 'E-commerce', color: '#10B981', description: 'Online store and shopping cart builds' },
  { name: 'Branding & Design', color: '#F59E0B', description: 'Brand identity, logos, and UI/UX design' },
  { name: 'Digital Marketing', color: '#6366F1', description: 'SEO, campaigns, and content strategy' },
  { name: 'Custom Software', color: '#06B6D4', description: 'Tailored enterprise software development' },
  { name: 'Other', color: '#6B7280', description: 'General or uncategorized projects' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const db = prisma as any;

    let categories = await db.projectCategory.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    // Seed default categories if none exist yet
    if (categories.length === 0) {
      await db.projectCategory.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          companyId,
          ...cat,
        })),
      });

      categories = await db.projectCategory.findMany({
        where: { companyId },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[API GET /api/projects/categories] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project categories.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = projectCategoryFormSchema.parse(body);
    const companyId = body.companyId || 'comp_001';
    const db = prisma as any;

    const category = await db.projectCategory.create({
      data: {
        companyId,
        name: validated.name,
        description: validated.description || null,
        color: validated.color || '#3B82F6',
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/projects/categories] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create project category.' },
      { status: 400 }
    );
  }
}
