'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { LockIcon, SaveIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageShell } from '@/components/layout';
import {
  Form,
  FormInput,
  SubmitButton,
} from '@/components/forms';
import { AvatarUploader } from '@/components/uploads';
import { profileApi } from '@/lib/api/client';
import { profileUpdateSchema } from '@/lib/validation/admin';
import { initials } from '@/lib/formatters';
import type { ProfileUpdateInput } from '@/lib/api/client';

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });
type PasswordFormValues = z.input<typeof passwordFormSchema>;

export default function ProfileEditPage() {
  const t = useTranslations('admin.profile');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  const profileSchema = profileUpdateSchema as unknown as z.ZodType<ProfileUpdateInput>;
  const profileDefaults: ProfileUpdateInput = {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
    avatar: user.avatar ?? '',
  };

  const submitProfile = async (values: ProfileUpdateInput) => {
    const updated = await profileApi.update(values);
    await updateSession({
      ...session,
      user: {
        ...user,
        firstName: updated.firstName,
        lastName: updated.lastName,
        avatar: updated.avatar,
        phone: updated.phone,
      },
    });
    router.refresh();
  };

  const submitPassword = async (values: PasswordFormValues) => {
    await profileApi.update({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    router.refresh();
  };

  return (
    <PageShell title={t('title')} description={t('description')}>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="rounded-lg">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <AvatarUploader
              currentUrl={user.avatar ?? undefined}
              fallback={initials(fullName || user.email || '')}
              onUploaded={async (upload) => {
                const url = upload.publicUrl ?? `/api/uploads/${upload.id}`;
                await profileApi.update({ avatar: url });
                await updateSession({
                  ...session,
                  user: { ...user, avatar: url },
                });
                router.refresh();
              }}
              onRemoved={async () => {
                await profileApi.update({ avatar: '' });
                await updateSession({ ...session, user: { ...user, avatar: null } });
                router.refresh();
              }}
            />
            <h2 className="mt-2 text-lg font-semibold">{fullName || user.email}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">{t('title')}</TabsTrigger>
                <TabsTrigger value="password">{t('passwordSection')}</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-5">
                <Form<ProfileUpdateInput>
                  schema={profileSchema}
                  defaultValues={profileDefaults as never}
                  values={profileDefaults as never}
                  onSubmit={submitProfile}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput name="firstName" label={tAuth('firstNameLabel')} />
                    <FormInput name="lastName" label={tAuth('lastNameLabel')} />
                  </div>
                  <FormInput name="phone" label={tAuth('phoneLabel')} />
                  <SubmitButton>
                    <SaveIcon />
                    {tCommon('save')}
                  </SubmitButton>
                </Form>
              </TabsContent>

              <TabsContent value="password" className="mt-5">
                <Form<PasswordFormValues>
                  schema={passwordFormSchema as unknown as z.ZodType<PasswordFormValues>}
                  defaultValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  }}
                  onSubmit={submitPassword}
                  resetOnSuccess
                >
                  <FormInput
                    name="currentPassword"
                    label={tAuth('currentPasswordLabel')}
                    type="password"
                    description={t('currentPasswordHint')}
                  />
                  <FormInput
                    name="newPassword"
                    label={tAuth('newPasswordLabel')}
                    type="password"
                    description={t('newPasswordHint')}
                  />
                  <FormInput
                    name="confirmPassword"
                    label={tAuth('confirmPasswordLabel')}
                    type="password"
                  />
                  <SubmitButton>
                    <LockIcon />
                    {tCommon('update')}
                  </SubmitButton>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
