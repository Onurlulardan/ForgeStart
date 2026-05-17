'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/app/providers';

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part?.[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || email?.slice(0, 2).toUpperCase() || 'NS';
}

export default function Navbar({ collapsed, setCollapsed }: NavbarProps) {
  const { data: session } = useSession();
  const { isDark, toggleTheme } = useTheme();
  const user = session?.user;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpenIcon data-icon="inline-start" />
            ) : (
              <PanelLeftCloseIcon data-icon="inline-start" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
            >
              <MenuIcon data-icon="inline-start" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboardIcon />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/administrations" />}>
                  <SettingsIcon />
                  Administration
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none">Workspace Console</p>
            <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
              Drizzle, Auth.js and PostgreSQL starter operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <SunIcon data-icon="inline-start" /> : <MoonIcon data-icon="inline-start" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-2" />}>
              <Avatar className="size-7">
                <AvatarImage src={user?.avatar ?? undefined} alt={user?.email ?? 'User'} />
                <AvatarFallback>
                  {getInitials(user?.firstName, user?.lastName, user?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-36 truncate text-sm font-medium md:inline">
                {user?.firstName || user?.email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <span className="block truncate text-sm font-medium">
                  {fullName || user?.email}
                </span>
                <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/administrations/users/profile/edit" />}>
                  <UserIcon />
                  Profile settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
