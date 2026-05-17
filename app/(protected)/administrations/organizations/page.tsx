'use client';

import { useMemo, useState } from 'react';
import { EditIcon, PlusIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { DataGrid } from '@/components/data-grid';
import { PageShell, CrudSheet } from '@/components/layout';
import { PermissionButton } from '@/components/permission';
import { StatusBadge } from '@/components/app/status-badge';
import { useCrudResource } from '@/lib/hooks';
import { useOrganizations, useOrganizationMutations } from '@/lib/query';
import type { OrganizationInput, OrganizationWithCount } from '@/lib/api/client';
import { OrganizationForm } from './components/organization-form';
import { AddUsersDrawer } from './components/add-users-drawer';

export default function OrganizationsPage() {
  const t = useTranslations('admin.organizations');
  const tCommon = useTranslations('common');
  const { data: organizations = [], isLoading } = useOrganizations();
  const mutations = useOrganizationMutations();

  const rootOrganizations = useMemo(
    () => organizations.filter((organization) => !organization.parentId),
    [organizations]
  );

  const [addUsersTarget, setAddUsersTarget] = useState<OrganizationWithCount | null>(null);

  const crud = useCrudResource<OrganizationWithCount>({
    resource: 'organization',
    onDelete: async (organization) => {
      await mutations.remove.mutateAsync(organization.id);
    },
    deleteConfirm: {
      title: t('deleteTitle'),
      description: t('deleteDescription'),
    },
  });

  const submit = async (values: OrganizationInput) => {
    if (crud.selected) {
      await mutations.update.mutateAsync({ id: crud.selected.id, data: values });
    } else {
      await mutations.create.mutateAsync(values);
    }
    crud.closeForm();
  };

  const columns = useMemo<ColumnDef<OrganizationWithCount>[]>(
    () => [
      {
        id: 'organization',
        header: t('columns.organization'),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.slug}</div>
          </div>
        ),
      },
      {
        id: 'status',
        header: t('columns.status'),
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'members',
        header: t('columns.members'),
        cell: ({ row }) => row.original._count?.members ?? 0,
      },
    ],
    [t]
  );

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <PermissionButton resource="organization" action="create" onClick={crud.openCreate}>
          <PlusIcon />
          {t('createButton')}
        </PermissionButton>
      }
    >
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<OrganizationWithCount>
            data={rootOrganizations}
            columns={columns}
            loading={isLoading}
            columnVisibilityStorageKey="admin-organizations"
            exportFileName="organizations"
            toolbar={{ search: true, columnVisibility: true, exportable: true }}
            getSubRows={(row) => row.children}
            defaultExpandAll
            rowActions={() => [
              {
                label: tCommon('edit'),
                icon: <EditIcon />,
                disabled: () => !crud.permissions.canEdit,
                onSelect: crud.openEdit,
              },
              {
                label: t('addUsers'),
                icon: <UserPlusIcon />,
                disabled: () => !crud.permissions.canEdit,
                onSelect: (record) => setAddUsersTarget(record),
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
        <OrganizationForm
          key={crud.selected?.id ?? 'new'}
          initialValues={crud.selected}
          onSubmit={submit}
        />
      </CrudSheet>

      <AddUsersDrawer
        organization={addUsersTarget}
        open={Boolean(addUsersTarget)}
        onClose={() => setAddUsersTarget(null)}
      />
    </PageShell>
  );
}
