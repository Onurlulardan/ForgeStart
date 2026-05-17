'use client';

import { useMemo } from 'react';
import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataGrid } from '@/components/data-grid';
import { PageShell, CrudSheet } from '@/components/layout';
import { PermissionButton } from '@/components/permission';
import { StatusBadge } from '@/components/app/status-badge';
import { useCrudResource } from '@/lib/hooks';
import { useUsers, useUserMutations } from '@/lib/query';
import type { UserWithoutPassword } from '@/lib/api/client';
import { UserForm, type UserFormValues } from './components/user-form';

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const { data: users = [], isLoading } = useUsers();
  const mutations = useUserMutations();

  const crud = useCrudResource<UserWithoutPassword>({
    resource: 'user',
    onDelete: async (user) => {
      await mutations.remove.mutateAsync(user.id);
    },
    deleteConfirm: {
      title: t('deleteTitle'),
      description: t('deleteDescription'),
    },
  });

  const submit = async (values: UserFormValues) => {
    if (crud.selected) {
      await mutations.update.mutateAsync({ id: crud.selected.id, data: values });
    } else {
      await mutations.create.mutateAsync(values as never);
    }
    crud.closeForm();
  };

  const columns = useMemo<ColumnDef<UserWithoutPassword>[]>(
    () => [
      {
        id: 'name',
        header: t('columns.name'),
        cell: ({ row }) => {
          const record = row.original;
          const name = [record.firstName, record.lastName].filter(Boolean).join(' ');
          return (
            <div>
              <div className="font-medium">{name || record.email}</div>
              <div className="text-xs text-muted-foreground">{record.email}</div>
            </div>
          );
        },
      },
      {
        id: 'roles',
        header: t('columns.roles'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.userRoles?.length ? (
              row.original.userRoles.map((userRole) => (
                <Badge key={userRole.role.id} variant="secondary" className="rounded-md">
                  {userRole.role.name}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="rounded-md">
                {t('noRole')}
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: t('columns.status'),
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [t]
  );

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <PermissionButton resource="user" action="create" onClick={crud.openCreate}>
          <PlusIcon />
          {t('createButton')}
        </PermissionButton>
      }
    >
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<UserWithoutPassword>
            data={users}
            columns={columns}
            loading={isLoading}
            columnVisibilityStorageKey="admin-users"
            exportFileName="users"
            toolbar={{ search: true, columnVisibility: true, exportable: true }}
            rowActions={() => [
              {
                label: tCommon('edit'),
                icon: <EditIcon />,
                disabled: () => !crud.permissions.canEdit,
                onSelect: crud.openEdit,
              },
              {
                label: tCommon('delete'),
                icon: <Trash2Icon />,
                destructive: true,
                disabled: () => !crud.permissions.canDelete,
                onSelect: (record) => {
                  void crud.confirmDelete(record);
                },
              },
            ]}
            onRowDoubleClick={crud.permissions.canEdit ? crud.openEdit : undefined}
          />
        </CardContent>
      </Card>

      <CrudSheet
        open={crud.isFormOpen}
        onOpenChange={(open) => {
          if (!open) crud.closeForm();
        }}
        title={crud.selected ? t('editTitle') : t('createTitle')}
        description={crud.selected ? t('editDescription') : t('createDescription')}
      >
        <UserForm
          key={crud.selected?.id ?? 'new'}
          initialValues={crud.selected ?? undefined}
          onSubmit={submit}
        />
      </CrudSheet>
    </PageShell>
  );
}
