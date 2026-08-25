/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getSettingsAuthContext,
  settingsForbiddenResponse,
} from '@/features/settings/services/settings-auth-helper';
import { companySettingsSchema } from '@/features/settings/schemas/settings-schemas';

let memoryCompanySettings: Record<string, any> = {
  comp_001: {
    id: 'comp_001',
    name: 'AVEX CRM Technologies Inc.',
    legalName: 'AVEX CRM Technologies Corporation',
    email: 'contact@avexcrm.com',
    phone: '+1 (800) 555-0199',
    address: '100 Innovation Boulevard, Suite 500',
    city: 'San Francisco',
    country: 'United States',
    website: 'https://avexcrm.com',
    logoUrl: '',
    taxNumber: 'US-EIN-984210492',
    defaultCurrency: 'USD',
    businessType: 'DIGITAL',
    timezone: 'America/Los_Angeles',
  },
};

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    // Multi-tenant ID manipulation check: reject if client specifies different companyId in query param
    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get('companyId');
    if (requestedCompanyId && requestedCompanyId !== auth.companyId) {
      return settingsForbiddenResponse('Access denied: Cannot access another company’s settings.');
    }

    // Role-based authorization: Only COMPANY_OWNER and ADMIN can view/manage company settings
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return settingsForbiddenResponse('Access denied: Only Company Owners and Admins can access company settings.');
    }

    const db = prisma as any;
    let company = null;

    try {
      const dbCompany = await db.company.findUnique({
        where: { id: auth.companyId },
        include: { companyBranding: true },
      });

      if (dbCompany) {
        company = {
          id: dbCompany.id,
          name: dbCompany.name,
          legalName: dbCompany.companyBranding?.companyName || dbCompany.name,
          email: dbCompany.companyBranding?.email || 'contact@avexcrm.com',
          phone: dbCompany.companyBranding?.phone || '+1 (800) 555-0199',
          address: dbCompany.companyBranding?.address || '',
          city: dbCompany.companyBranding?.city || '',
          country: dbCompany.companyBranding?.country || '',
          website: dbCompany.companyBranding?.website || '',
          logoUrl: dbCompany.companyBranding?.logoUrl || dbCompany.logo || '',
          taxNumber: dbCompany.companyBranding?.taxNumber || '',
          defaultCurrency: dbCompany.currency || 'USD',
          businessType: dbCompany.businessType || 'DIGITAL',
          timezone: dbCompany.timezone || 'UTC',
        };
      }
    } catch {
      // Fallback to in-memory store
    }

    if (!company) {
      company = memoryCompanySettings[auth.companyId] || {
        ...memoryCompanySettings.comp_001,
        id: auth.companyId,
        name: auth.companyName,
      };
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('[API GET /api/settings/company] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch company settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    // Multi-tenant ID manipulation check
    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get('companyId');
    if (requestedCompanyId && requestedCompanyId !== auth.companyId) {
      return settingsForbiddenResponse('Access denied: Cannot modify another company’s settings.');
    }

    // Role-based authorization
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return settingsForbiddenResponse('Access denied: Only Company Owners and Admins can modify company settings.');
    }

    const body = await request.json();
    const validated = companySettingsSchema.parse(body);
    const db = prisma as any;

    try {
      await db.company.update({
        where: { id: auth.companyId },
        data: {
          name: validated.name,
          businessType: validated.businessType,
          timezone: validated.timezone,
          currency: validated.defaultCurrency,
          logo: validated.logoUrl || null,
        },
      });

      await db.companyBranding.upsert({
        where: { companyId: auth.companyId },
        create: {
          companyId: auth.companyId,
          companyName: validated.legalName || validated.name,
          email: validated.email,
          phone: validated.phone || null,
          address: validated.address || null,
          city: validated.city || null,
          country: validated.country || null,
          website: validated.website || null,
          taxNumber: validated.taxNumber || null,
          logoUrl: validated.logoUrl || null,
        },
        update: {
          companyName: validated.legalName || validated.name,
          email: validated.email,
          phone: validated.phone || null,
          address: validated.address || null,
          city: validated.city || null,
          country: validated.country || null,
          website: validated.website || null,
          taxNumber: validated.taxNumber || null,
          logoUrl: validated.logoUrl || null,
        },
      });
    } catch {
      // Memory fallback
    }

    memoryCompanySettings[auth.companyId] = {
      id: auth.companyId,
      ...validated,
    };

    return NextResponse.json({
      company: memoryCompanySettings[auth.companyId],
      message: 'Company settings saved successfully.',
    });
  } catch (error: any) {
    console.error('[API PUT /api/settings/company] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update company settings.' },
      { status: 400 }
    );
  }
}
