/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';

export async function ensureDatabaseDependencies(
  companyId: string = 'comp_001',
  customerId?: string,
  userId: string = 'usr_001'
) {
  const db = prisma as any;

  try {
    // 1. Ensure Default Company exists
    if (db.company?.upsert) {
      await db.company.upsert({
        where: { id: companyId },
        update: {},
        create: {
          id: companyId,
          name: 'AVEX CRM Workspace',
          domain: 'avexcrm.io',
          status: 'ACTIVE',
        },
      });
    }

    // 2. Ensure Default User exists
    if (db.user?.upsert) {
      await db.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          companyId,
          email: 'admin@avexcrm.io',
          fullName: 'System Administrator',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
    }

    // 3. Ensure Customer exists if provided or default customer
    const targetCustId = customerId || 'cust_001';
    if (db.customer?.upsert) {
      await db.customer.upsert({
        where: { id: targetCustId },
        update: {},
        create: {
          id: targetCustId,
          companyId,
          name: 'Sarah Connor',
          companyName: 'Cyberdyne Systems',
          email: 'sarah@cyberdyne.io',
          phone: '+1 555-0199',
          status: 'ACTIVE',
        },
      });
    }
  } catch (err) {
    console.warn('[db-seed-helper] Notice while ensuring DB dependencies:', err);
  }
}
