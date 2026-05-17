'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowRightIcon,
  ActivityIcon,
  AppWindowIcon,
  Building2Icon,
  ClipboardListIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserCogIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/lib/auth/client-permissions';

const adminCards = [
  {
    title: 'Users',
    description: 'Create accounts, assign roles and control account status.',
    href: '/administrations/users',
    permission: ['user', 'view'],
    icon: UsersIcon,
  },
  {
    title: 'Organizations',
    description: 'Maintain workspace hierarchy, membership and organization status.',
    href: '/administrations/organizations',
    permission: ['organization', 'view'],
    icon: Building2Icon,
  },
  {
    title: 'Roles',
    description: 'Model global and organization-scoped access roles.',
    href: '/administrations/roles',
    permission: ['role', 'view'],
    icon: ShieldCheckIcon,
  },
  {
    title: 'Permissions',
    description: 'Connect resources, actions and access targets in one place.',
    href: '/administrations/permissions',
    permission: ['permission', 'view'],
    icon: KeyRoundIcon,
  },
  {
    title: 'RBAC matrix',
    description: 'Edit role grants across resources and actions in a compact matrix.',
    href: '/administrations/rbac',
    permission: ['permission', 'edit'],
    icon: ClipboardListIcon,
  },
  {
    title: 'Invitations',
    description: 'Invite users with role and organization assignment.',
    href: '/administrations/invitations',
    permission: ['invitation', 'view'],
    icon: UserPlusIcon,
  },
  {
    title: 'API keys',
    description: 'Issue scoped service credentials for integrations.',
    href: '/administrations/api-keys',
    permission: ['api-key', 'view'],
    icon: AppWindowIcon,
  },
  {
    title: 'Security logs',
    description: 'Review authentication attempts and security-relevant events.',
    href: '/administrations/security-logs',
    permission: ['security-log', 'view'],
    icon: LockKeyholeIcon,
  },
  {
    title: 'Audit logs',
    description: 'Review operational changes across admin workflows.',
    href: '/administrations/audit-logs',
    permission: ['audit-log', 'view'],
    icon: ActivityIcon,
  },
  {
    title: 'System center',
    description: 'Check health, migration status, setup doctor and app settings.',
    href: '/administrations/system',
    permission: ['system', 'view'],
    icon: SlidersHorizontalIcon,
  },
] as const;

function initials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  return (
    [firstName, lastName]
      .filter(Boolean)
      .map((part) => part?.[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    email?.slice(0, 2).toUpperCase() ||
    'NS'
  );
}

export default function AdministrationsPage() {
  const { data: session } = useSession();
  const canViewUsers = usePermission('user', 'view');
  const canViewOrganizations = usePermission('organization', 'view');
  const canViewRoles = usePermission('role', 'view');
  const canViewPermissions = usePermission('permission', 'view');
  const canEditPermissions = usePermission('permission', 'edit');
  const canViewSecurityLogs = usePermission('security-log', 'view');
  const canViewInvitations = usePermission('invitation', 'view');
  const canViewApiKeys = usePermission('api-key', 'view');
  const canViewAuditLogs = usePermission('audit-log', 'view');
  const canViewSystem = usePermission('system', 'view');
  const permissions = {
    user: canViewUsers,
    organization: canViewOrganizations,
    role: canViewRoles,
    permission: canViewPermissions,
    'permission:edit': canEditPermissions,
    'security-log': canViewSecurityLogs,
    invitation: canViewInvitations,
    'api-key': canViewApiKeys,
    'audit-log': canViewAuditLogs,
    system: canViewSystem,
  };

  if (!session?.user) {
    redirect('/auth/login');
  }

  const user = session.user;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <>
      <PageHeader
        title="Administration"
        description="Operate users, organizations, roles and permissions from a single starter console."
      />

      <Card className="rounded-lg">
        <CardContent className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.avatar ?? undefined} alt={user.email ?? 'User'} />
              <AvatarFallback>{initials(user.firstName, user.lastName, user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{fullName || user.email}</h2>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.userRoles?.length ? (
                  user.userRoles.map((userRole) => (
                    <Badge key={userRole.role.id} variant="secondary" className="rounded-md">
                      {userRole.role.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="rounded-md">
                    No role
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button render={<Link href="/administrations/users/profile/edit" />} variant="outline">
            <UserCogIcon data-icon="inline-start" />
            Edit profile
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminCards
          .filter((card) =>
            card.permission[1] === 'edit'
              ? permissions[`${card.permission[0]}:edit` as keyof typeof permissions]
              : permissions[card.permission[0] as keyof typeof permissions]
          )
          .map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.href} className="rounded-lg">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button render={<Link href={card.href} />} variant="outline" className="w-full">
                    Open
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
      </section>
    </>
  );
}
