'use client';

import { useMemo, useState } from 'react';
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { DataGrid } from '@/components/data-grid';
import { PageShell, CrudSheet } from '@/components/layout';
import { PermissionButton } from '@/components/permission';
import { StatusBadge } from '@/components/app/status-badge';
import {
  Form,
  FormInput,
  FormSelect,
  SubmitButton,
} from '@/components/forms';
import { useClipboard, useCrudResource } from '@/lib/hooks';
import {
  useInvitations,
  useInvitationMutations,
  useOrganizations,
  useRoles,
} from '@/lib/query';
import { invitationCreateSchema } from '@/lib/validation/admin';
import { formatDate } from '@/lib/formatters';
import type {
  InvitationCreateInput,
  InvitationWithRelations,
} from '@/lib/api/client';
import { z } from 'zod';

const NO_VALUE = '__none__';

export default function InvitationsPage() {
  const t = useTranslations('admin.invitations');
  const tCommon = useTranslations('common');
  const { data: invitations = [], isLoading } = useInvitations();
  const { data: roles = [] } = useRoles();
  const { data: organizations = [] } = useOrganizations();
  const mutations = useInvitationMutations();

  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);
  const { copy, copied } = useClipboard();
  const schema = invitationCreateSchema as unknown as z.ZodType<InvitationCreateInput>;

  const crud = useCrudResource<InvitationWithRelations>({
    resource: 'invitation',
    onDelete: async (invitation) => {
      await mutations.revoke.mutateAsync(invitation.id);
    },
    deleteConfirm: {
      title: t('revokeTitle'),
      description: t('revokeDescription'),
    },
  });

  const createInvitation = async (values: InvitationCreateInput) => {
    const response = await mutations.create.mutateAsync(values);
    setAcceptUrl(response.acceptUrl);
  };

  const columns = useMemo<ColumnDef<InvitationWithRelations>[]>(
    () => [
      {
        id: 'email',
        header: t('columns.email'),
        accessorKey: 'email',
        cell: ({ row }) => <span className="font-medium">{row.original.email}</span>,
      },
      {
        id: 'role',
        header: t('columns.role'),
        cell: ({ row }) => row.original.role?.name ?? '—',
      },
      {
        id: 'organization',
        header: t('columns.organization'),
        cell: ({ row }) => row.original.organization?.name ?? '—',
      },
      {
        id: 'status',
        header: t('columns.status'),
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'expiresAt',
        header: t('columns.expiresAt'),
        cell: ({ row }) => formatDate(row.original.expiresAt),
      },
    ],
    [t]
  );

  const defaultValues: InvitationCreateInput = {
    email: '',
    roleId: null,
    organizationId: null,
    expiresInDays: 7,
  };

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <PermissionButton resource="invitation" action="create" onClick={crud.openCreate}>
          <PlusIcon />
          {t('createButton')}
        </PermissionButton>
      }
    >
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<InvitationWithRelations>
            data={invitations}
            columns={columns}
            loading={isLoading}
            columnVisibilityStorageKey="admin-invitations"
            exportFileName="invitations"
            toolbar={{ search: true, columnVisibility: true, exportable: true }}
            rowActions={(record) => [
              {
                label: t('revoke'),
                icon: <Trash2Icon />,
                destructive: true,
                disabled: () => record.status !== 'PENDING' || !crud.permissions.canDelete,
                onSelect: (item) => {
                  void crud.confirmDelete(item);
                },
              },
            ]}
          />
        </CardContent>
      </Card>

      <CrudSheet
        open={crud.isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            crud.closeForm();
            setAcceptUrl(null);
          }
        }}
        title={t('createTitle')}
        description={t('createDescription')}
      >
        <Form<InvitationCreateInput>
          schema={schema}
          defaultValues={defaultValues as never}
          onSubmit={createInvitation}
        >
          <FormInput name="email" label={tCommon('email')} type="email" />
          <FormSelect
            name="roleId"
            label={t('columns.role')}
            emptyValue={NO_VALUE}
            options={[
              { value: NO_VALUE, label: tCommon('all') },
              ...roles.map((role) => ({ value: role.id, label: role.name })),
            ]}
          />
          <FormSelect
            name="organizationId"
            label={t('columns.organization')}
            emptyValue={NO_VALUE}
            options={[
              { value: NO_VALUE, label: tCommon('all') },
              ...organizations.map((organization) => ({
                value: organization.id,
                label: organization.name,
              })),
            ]}
          />
          <FormInput
            name="expiresInDays"
            label={t('expiresInDays')}
            type="number"
            min={1}
            max={90}
          />
          {acceptUrl && (
            <Field>
              <FieldLabel>{tCommon('details')}</FieldLabel>
              <div className="flex gap-2">
                <Input value={acceptUrl} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copy(acceptUrl)}
                  aria-label={tCommon('copy')}
                >
                  <CopyIcon />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-muted-foreground">{tCommon('copied')}</p>
              )}
            </Field>
          )}
          <SubmitButton className="w-full">{t('createButton')}</SubmitButton>
        </Form>
      </CrudSheet>
    </PageShell>
  );
}
