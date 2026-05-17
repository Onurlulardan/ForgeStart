'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, Building2Icon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermission } from '@/lib/auth/client-permissions';
import { getRequest } from '@/lib/apiClient';

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  activeUsers: number;
}

const statMeta = [
  {
    key: 'totalOrganizations',
    label: 'Organizations',
    description: 'Root and child workspaces',
    icon: Building2Icon,
  },
  {
    key: 'totalUsers',
    label: 'Users',
    description: 'Registered accounts',
    icon: UsersIcon,
  },
  {
    key: 'activeUsers',
    label: 'Active users',
    description: 'Enabled for sign in',
    icon: ShieldCheckIcon,
  },
] as const;

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const canViewStats = usePermission('dashboard', 'view');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!canViewStats) return;
      setLoading(true);
      try {
        const data = await getRequest<DashboardStats>('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [canViewStats]);

  const name = [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(' ');

  return (
    <>
      <PageHeader
        title={`Welcome${name ? `, ${name}` : ''}`}
        description="A starter workspace with local-first database, auth and admin workflows ready for development."
        actions={
          <Button render={<Link href="/administrations" />}>
            Go to administration
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {statMeta.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="rounded-lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="mt-2 text-3xl">
                      {loading ? <Skeleton className="h-8 w-16" /> : stats[item.key]}
                    </CardTitle>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Starter readiness</CardTitle>
          <CardDescription>
            What this V2 baseline gives a local developer immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            'Compose starts PostgreSQL and app together',
            'Drizzle owns migration and seed flow',
            'Permission checks return API-first JSON responses',
          ].map((item) => (
            <div key={item} className="rounded-lg border bg-background p-4 text-sm">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
