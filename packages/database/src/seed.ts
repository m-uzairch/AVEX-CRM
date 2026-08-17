import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AVEX CRM database seeding...');

  // 1. Seed Default Permissions
  const permissionsData = [
    { code: 'MANAGE_COMPANY', name: 'Manage Company Profile', group: 'Administration' },
    { code: 'MANAGE_BILLING', name: 'Manage Subscription & Billing', group: 'Administration' },
    { code: 'MANAGE_USERS', name: 'User & Role Management', group: 'Administration' },
    { code: 'MANAGE_SETTINGS', name: 'Company Settings', group: 'Administration' },
    { code: 'MANAGE_CRM', name: 'CRM & Customer Deals', group: 'Operations' },
    { code: 'MANAGE_PROJECTS', name: 'Projects & Tasks', group: 'Operations' },
    { code: 'MANAGE_EMPLOYEES', name: 'Employee Directory', group: 'Operations' },
    { code: 'MANAGE_ATTENDANCE', name: 'Attendance Tracking', group: 'Operations' },
    { code: 'MANAGE_INVOICES', name: 'Invoices & Billing', group: 'Finance' },
    { code: 'MANAGE_INVENTORY', name: 'Inventory & Products', group: 'Logistics' },
    { code: 'MANAGE_REPORTS', name: 'Reports & Business Intelligence', group: 'Analytics' },
    { code: 'VIEW_CLIENT_PORTAL', name: 'Client Portal View', group: 'Portal' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, group: perm.group },
      create: perm,
    });
  }
  console.log('✅ Default permissions seeded.');

  // 2. Seed Default Roles
  const rolesData = [
    { name: 'Company Owner', description: 'Full access to entire company workspace and settings', isSystem: true },
    { name: 'Admin', description: 'Full operational access to CRM, Projects, Invoices, and HR', isSystem: true },
    { name: 'Employee', description: 'Staff access to assigned projects, tasks, and attendance', isSystem: true },
    { name: 'Client', description: 'Client portal view for assigned projects and invoices', isSystem: true },
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log('✅ Default system roles seeded.');

  // 3. Seed Sample Development Company
  const company = await prisma.company.upsert({
    where: { id: 'comp_demo_1' },
    update: { name: 'Acme Technologies Inc.' },
    create: {
      id: 'comp_demo_1',
      name: 'Acme Technologies Inc.',
      businessType: 'DIGITAL',
      timezone: 'UTC',
      currency: 'USD',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Sample Company created: ${company.name}`);

  // 4. Seed Sample Admin User
  const ownerRole = await prisma.role.findUnique({ where: { name: 'Company Owner' } });

  const user = await prisma.user.upsert({
    where: { email: 'alex@acme.com' },
    update: { fullName: 'Alex Carter' },
    create: {
      supabaseUserId: 'sub_demo_alex_123',
      companyId: company.id,
      fullName: 'Alex Carter',
      email: 'alex@acme.com',
      status: 'ACTIVE',
      profile: {
        create: {
          jobTitle: 'Chief Executive Officer',
          bio: 'Founder and lead administrator for Acme Technologies.',
        },
      },
    },
  });

  if (ownerRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: ownerRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: ownerRole.id,
      },
    });
  }
  console.log(`✅ Sample Admin User created: ${user.fullName} (${user.email})`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
