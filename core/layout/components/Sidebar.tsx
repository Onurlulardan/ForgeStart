'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboardIcon, ShieldCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
}

const navItems = [
  {
    href: '/dashboard',
    key: 'dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    href: '/administrations',
    key: 'administration',
    icon: ShieldCheckIcon,
  },
] as const;

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <Image src="/brand/forgestart-mark.svg" alt="" width={36} height={36} className="size-9" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">ForgeStart</p>
            <p className="truncate text-xs text-sidebar-foreground/60">v2 operations console</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const label = t(item.key);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/60 p-3">
            <p className="text-xs font-medium">Local-first starter</p>
            <p className="mt-1 text-xs leading-5 text-sidebar-foreground/60">
              Docker, Drizzle, Auth.js & TanStack are wired for clone-to-run development.
            </p>
          </div>
        ) : (
          <div className="mx-auto size-2 rounded-full bg-sidebar-primary" />
        )}
      </div>
    </aside>
  );
}
