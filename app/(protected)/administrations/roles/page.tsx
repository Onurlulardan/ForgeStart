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
import { useCrudResource } from '@/lib/hooks';
import { useRoles, useRoleMutations } from '@/lib/query';
import type { RoleInput, RoleWithCount } from '@/lib/api/client';
import { RoleForm } from './components/role-form';

export default function RolesPage() {
  const t = useTranslations('admin.roles');
  const tCommon = useTranslations('common');
  const { data: roles = [], isLoading } = useRoles();
  const mutations = useRoleMutations();

  const crud = useCrudResource<RoleWithCount>({
    resource: 'role',
    onDelete: async (role) => {
      await mutations.remove.mutateAsync(role.id);
    },
    deleteConfirm: {
      title: t('deleteTitle'),
      description: t('deleteDescription'),
    },
  });

  const submit = async (values: RoleInput) => {
    if (crud.selected) {
      await mutations.update.mutateAsync({ id: crud.selected.id, data: values });
    } else {
      await mutations.create.mutateAsync(values);
    }
    crud.closeForm();
  };

  const columns = useMemo<ColumnDef<RoleWithCount>[]>(
    () => [
      {
        id: 'name',
        header: t('columns.name'),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="max-w-md truncate text-xs text-muted-foreground">
              {row.original.description || tCommon('noData')}
            </div>
          </div>
        ),
      },
      {
        id: 'scope',
        header: t('columns.scope'),
        cell: ({ row }) =>
          row.original.organizationId ? t('scopeOrganization') : t('scopeGlobal'),
      },
      {
        id: 'isDefault',
        header: t('isDefault'),
        accessorKey: 'isDefault',
        cell: ({ row }) =>
          row.original.isDefault ? (
            <Badge variant="secondary" className="rounded-md">
              {t('isDefault')}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: 'users',
        header: t('columns.users'),
        cell: ({ row }) => row.original._count?.users ?? 0,
      },
    ],
    [t, tCommon]
  );

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <PermissionButton resource="role" action="create" onClick={crud.openCreate}>
          <PlusIcon />
          {t('createButton')}
        </PermissionButton>
      }
    >
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<RoleWithCount>
            data={roles}
            columns={columns}
            loading={isLoading}
            columnVisibilityStorageKey="admin-roles"
            exportFileName="roles"
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
        <RoleForm
          key={crud.selected?.id ?? 'new'}
          initialValues={crud.selected}
          onSubmit={submit}
        />
      </CrudSheet>
    </PageShell>
  );
}
