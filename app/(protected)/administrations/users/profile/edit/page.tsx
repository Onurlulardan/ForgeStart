'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LockIcon, SaveIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/app/page-header';
import { putRequest } from '@/lib/apiClient';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

interface ProfileResponse {
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  phone: string | null;
}

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

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;
  const [profileValues, setProfileValues] = useState<ProfileFormData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    avatar: user?.avatar ?? '',
  });
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user) return;
    setProfileValues({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      avatar: user.avatar ?? '',
    });
  }, [user]);

  if (!user) {
    return null;
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await putRequest<ProfileResponse>(
        '/administrations/profile',
        profileValues
      );

      await updateSession({
        ...session,
        user: {
          ...user,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          phone: updatedUser.phone,
        },
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordValues.newPassword !== passwordValues.confirmPassword) return;

    setPasswordLoading(true);
    try {
      await putRequest('/administrations/profile', {
        currentPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
      });
      setPasswordValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profile settings"
        description="Manage your account identity and password."
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="rounded-lg">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-24">
              <AvatarImage
                src={profileValues.avatar || user.avatar || undefined}
                alt={user.email ?? 'User'}
              />
              <AvatarFallback>{initials(user.firstName, user.lastName, user.email)}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-semibold">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-6 w-full rounded-lg border bg-muted/40 p-3 text-left text-xs leading-5 text-muted-foreground">
              Avatar is stored as a URL. This keeps the starter storage-agnostic until a project
              chooses S3, UploadThing or another file layer.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Update profile fields without changing authentication state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-5">
                <form onSubmit={handleProfileSubmit}>
                  <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="firstName">First name</FieldLabel>
                        <Input
                          id="firstName"
                          value={profileValues.firstName}
                          onChange={(event) =>
                            setProfileValues((current) => ({
                              ...current,
                              firstName: event.target.value,
                            }))
                          }
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                        <Input
                          id="lastName"
                          value={profileValues.lastName}
                          onChange={(event) =>
                            setProfileValues((current) => ({
                              ...current,
                              lastName: event.target.value,
                            }))
                          }
                          required
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input id="email" value={user.email ?? ''} disabled />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>
                      <Input
                        id="phone"
                        value={profileValues.phone ?? ''}
                        onChange={(event) =>
                          setProfileValues((current) => ({ ...current, phone: event.target.value }))
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
                      <Input
                        id="avatar"
                        type="url"
                        value={profileValues.avatar ?? ''}
                        onChange={(event) =>
                          setProfileValues((current) => ({
                            ...current,
                            avatar: event.target.value,
                          }))
                        }
                      />
                      <FieldDescription>Leave empty to use initials.</FieldDescription>
                    </Field>

                    <Button type="submit" disabled={loading}>
                      <SaveIcon data-icon="inline-start" />
                      {loading ? 'Saving...' : 'Save changes'}
                    </Button>
                  </FieldGroup>
                </form>
              </TabsContent>

              <TabsContent value="password" className="mt-5">
                <form onSubmit={handlePasswordSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordValues.currentPassword}
                        onChange={(event) =>
                          setPasswordValues((current) => ({
                            ...current,
                            currentPassword: event.target.value,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                      <Input
                        id="newPassword"
                        type="password"
                        minLength={8}
                        value={passwordValues.newPassword}
                        onChange={(event) =>
                          setPasswordValues((current) => ({
                            ...current,
                            newPassword: event.target.value,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field
                      data-invalid={Boolean(
                        passwordValues.confirmPassword &&
                        passwordValues.newPassword !== passwordValues.confirmPassword
                      )}
                    >
                      <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                      <Input
                        id="confirmPassword"
                        type="password"
                        minLength={8}
                        value={passwordValues.confirmPassword}
                        onChange={(event) =>
                          setPasswordValues((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        aria-invalid={Boolean(
                          passwordValues.confirmPassword &&
                          passwordValues.newPassword !== passwordValues.confirmPassword
                        )}
                        required
                      />
                      {passwordValues.confirmPassword &&
                        passwordValues.newPassword !== passwordValues.confirmPassword && (
                          <FieldDescription className="text-destructive">
                            Passwords do not match.
                          </FieldDescription>
                        )}
                    </Field>
                    <Button
                      type="submit"
                      disabled={
                        passwordLoading ||
                        !passwordValues.currentPassword ||
                        !passwordValues.newPassword ||
                        passwordValues.newPassword !== passwordValues.confirmPassword
                      }
                    >
                      <LockIcon data-icon="inline-start" />
                      {passwordLoading ? 'Updating...' : 'Update password'}
                    </Button>
                  </FieldGroup>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
