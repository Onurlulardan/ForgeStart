import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { createNodeDb } from './node';
import {
  auditLogs,
  organizationMembers,
  organizations,
  roles,
  securityLogs,
  userRoles,
  users,
} from './schema';
import { seedDatabase } from './seed';
import { generateSlug } from '../lib/utils/slug';

async function main() {
  const { db, pool } = createNodeDb();

  try {
    await seedDatabase(db);

    const [adminRole] = await db.select().from(roles).where(eq(roles.name, 'ADMIN')).limit(1);
    const [memberRole] = await db.select().from(roles).where(eq(roles.name, 'MEMBER')).limit(1);
    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'superadmin@example.com'))
      .limit(1);

    if (!adminRole || !memberRole || !owner) {
      throw new Error('Base seed must create admin/member roles and super admin user');
    }

    const demoOrgs = ['Acme Operations', 'Northwind Labs', 'Globex Support'];
    const passwordHash = await bcrypt.hash('change-this-password', 12);

    for (const orgName of demoOrgs) {
      const slug = generateSlug(orgName);
      const [organization] = await db
        .insert(organizations)
        .values({ name: orgName, slug, ownerId: owner.id, status: 'ACTIVE' })
        .onConflictDoUpdate({
          target: organizations.slug,
          set: { name: orgName, ownerId: owner.id, status: 'ACTIVE', updatedAt: new Date() },
        })
        .returning();

      for (let index = 1; index <= 3; index += 1) {
        const email = `${slug}-member-${index}@example.com`;
        const [user] = await db
          .insert(users)
          .values({
            email,
            firstName: `Demo ${index}`,
            lastName: orgName.split(' ')[0],
            name: `Demo ${index} ${orgName.split(' ')[0]}`,
            passwordHash,
            status: index === 3 ? 'INACTIVE' : 'ACTIVE',
            emailVerified: new Date(),
          })
          .onConflictDoUpdate({
            target: users.email,
            set: { status: index === 3 ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date() },
          })
          .returning();

        await db
          .insert(userRoles)
          .values({ userId: user.id, roleId: memberRole.id })
          .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] });

        await db
          .insert(organizationMembers)
          .values({ userId: user.id, organizationId: organization.id, roleId: memberRole.id })
          .onConflictDoNothing({
            target: [organizationMembers.organizationId, organizationMembers.userId],
          });
      }
    }

    await db.insert(securityLogs).values([
      {
        userId: owner.id,
        email: owner.email,
        ipAddress: '127.0.0.1',
        userAgent: 'Demo Seed',
        status: 'SUCCESS',
        type: 'LOGIN',
        message: 'Demo successful login event',
      },
      {
        userId: null,
        email: 'unknown@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Demo Seed',
        status: 'FAILED',
        type: 'LOGIN',
        message: 'Demo failed login event',
      },
    ]);

    await db.insert(auditLogs).values({
      actorId: owner.id,
      actorEmail: owner.email,
      action: 'demo.seed',
      resource: 'system',
      status: 'SUCCESS',
      message: 'Demo data seeded',
      metadata: { organizations: demoOrgs.length },
    });

    console.log('Demo seed completed');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Demo seed failed:', error);
  process.exit(1);
});
