'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  ActivityIcon,
  AppWindowIcon,
  ArrowRightIcon,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { usePermission } from '@/lib/auth/client-permissions';
import { initials } from '@/lib/formatters';

interface AdminCard {
  titleKey: string;
  descriptionKey: string;
  href: string;
  permission: [string, string];
  icon: React.ComponentType<{ className?: string }>;
}

const ADMIN_CARDS: AdminCard[] = [
  {
    titleKey: 'admin.users.title',
    descriptionKey: 'admin.users.description',
    href: '/administrations/users',
    permission: ['user', 'view'],
    icon: UsersIcon,
  },
  {
    titleKey: 'admin.organizations.title',
    descriptionKey: 'admin.organizations.description',
    href: '/administrations/organizations',
    permission: ['organization', 'view'],
    icon: Building2Icon,
  },
  {
    titleKey: 'admin.roles.title',
    descriptionKey: 'admin.roles.description',
    href: '/administrations/roles',
    permission: ['role', 'view'],
    icon: ShieldCheckIcon,
  },
  {
    titleKey: 'admin.permissions.title',
    descriptionKey: 'admin.permissions.description',
    href: '/administrations/permissions',
    permission: ['permission', 'view'],
    icon: KeyRoundIcon,
  },
  {
    titleKey: 'admin.rbac.title',
    descriptionKey: 'admin.rbac.description',
    href: '/administrations/rbac',
    permission: ['permission', 'edit'],
    icon: ClipboardListIcon,
  },
  {
    titleKey: 'admin.invitations.title',
    descriptionKey: 'admin.invitations.description',
    href: '/administrations/invitations',
    permission: ['invitation', 'view'],
    icon: UserPlusIcon,
  },
  {
    titleKey: 'admin.apiKeys.title',
    descriptionKey: 'admin.apiKeys.description',
    href: '/administrations/api-keys',
    permission: ['api-key', 'view'],
    icon: AppWindowIcon,
  },
  {
    titleKey: 'admin.securityLogs.title',
    descriptionKey: 'admin.securityLogs.description',
    href: '/administrations/security-logs',
    permission: ['security-log', 'view'],
    icon: LockKeyholeIcon,
  },
  {
    titleKey: 'admin.auditLogs.title',
    descriptionKey: 'admin.auditLogs.description',
    href: '/administrations/audit-logs',
    permission: ['audit-log', 'view'],
    icon: ActivityIcon,
  },
  {
    titleKey: 'admin.system.title',
    descriptionKey: 'admin.system.description',
    href: '/administrations/system',
    permission: ['system', 'view'],
    icon: SlidersHorizontalIcon,
  },
];

function PermittedCard({ card }: { card: AdminCard }) {
  const t = useTranslations();
  const allowed = usePermission(card.permission[0], card.permission[1]);
  if (!allowed) return null;

  const Icon = card.icon;

  return (
    <Card className="h-full rounded-lg">
      <CardHeader className="flex-1">
        <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </div>
        <CardTitle>{t(card.titleKey)}</CardTitle>
        <CardDescription>{t(card.descriptionKey)}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button render={<Link href={card.href} />} variant="outline" className="w-full">
          {t('common.view')}
          <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AdministrationsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tUsers = useTranslations('admin.users');
  const { data: session } = useSession();
  const user = session?.user;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  if (!user) return null;

  return (
    <PageShell title={t('hubTitle')} description={t('hubDescription')}>
      <Card className="rounded-lg">
        <CardContent className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.avatar ?? undefined} alt={user.email ?? 'User'} />
              <AvatarFallback>
                {initials([user.firstName, user.lastName].filter(Boolean).join(' ')) ||
                  user.email?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
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
                    {tUsers('noRole')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button render={<Link href="/administrations/users/profile/edit" />} variant="outline">
            <UserCogIcon />
            {tCommon('edit')}
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_CARDS.map((card) => (
          <PermittedCard key={card.href} card={card} />
        ))}
      </section>
    </PageShell>
  );
}
