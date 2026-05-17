'use client';

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
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { useTheme } from '@/app/providers';
import { initials as makeInitials } from '@/lib/formatters';
import { LanguageSwitcher } from './language-switcher';

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

function buildInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const initials = makeInitials([firstName, lastName].filter(Boolean).join(' '));
  if (initials) return initials;
  return email?.slice(0, 2).toUpperCase() ?? 'NS';
}

export default function Navbar({ collapsed, setCollapsed }: NavbarProps) {
  const { data: session } = useSession();
  const { isDark, toggleTheme } = useTheme();
  const t = useTranslations('userMenu');
  const tNav = useTranslations('nav');
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
            {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
            >
              <MenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboardIcon />
                  {tNav('dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/administrations" />}>
                  <SettingsIcon />
                  {tNav('administration')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none">Workspace Console</p>
            <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
              Drizzle, Auth.js, TanStack & PostgreSQL starter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t('switchTheme')}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-2" />}>
              <Avatar className="size-7">
                <AvatarImage src={user?.avatar ?? undefined} alt={user?.email ?? 'User'} />
                <AvatarFallback>
                  {buildInitials(user?.firstName, user?.lastName, user?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-36 truncate text-sm font-medium md:inline">
                {user?.firstName || user?.email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-1.5 py-1.5">
                <span className="block truncate text-sm font-medium">
                  {fullName || user?.email}
                </span>
                <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/administrations/users/profile/edit" />}>
                  <UserIcon />
                  {t('profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                  <LogOutIcon />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
