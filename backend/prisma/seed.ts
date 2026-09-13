declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@unsaid.me';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`[Seed] Created admin account: ${user.email} (Role: ${user.role})`);
  } else {
    console.log(`[Seed] Admin account ${adminEmail} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
