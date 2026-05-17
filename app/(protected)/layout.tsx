'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/core/layout/components/Navbar';
import Sidebar from '@/core/layout/components/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function ProtectedSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-72 border-r bg-sidebar" />
      </div>
      <div className="lg:pl-72">
        <div className="border-b bg-background px-8 py-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <main className="p-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return <ProtectedSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_28rem),var(--background)]">
      <Sidebar collapsed={collapsed} />
      <div
        className={cn(
          'min-h-screen transition-[padding] duration-200',
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedContent>{children}</ProtectedContent>;
}
