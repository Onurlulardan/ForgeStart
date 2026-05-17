'use client';

import { useMemo } from 'react';
import { EditIcon, KeyRoundIcon, LayersIcon, PlusIcon, Trash2Icon, ZapIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataGrid } from '@/components/data-grid';
import { PageShell, CrudSheet } from '@/components/layout';
import { PermissionButton } from '@/components/permission';
import { useCrudResource } from '@/lib/hooks';
import {
  useActions,
  useActionMutations,
  usePermissions,
  usePermissionMutations,
  useResources,
  useResourceMutations,
} from '@/lib/query';
import type {
  Action,
  ActionInput,
  PermissionInput,
  PermissionWithRelations,
  Resource,
  ResourceInput,
} from '@/lib/api/client';
import { ActionForm } from './components/action-form';
import { PermissionForm } from './components/permission-form';
import { ResourceForm } from './components/resource-form';

function PermissionsTab() {
  const t = useTranslations('admin.permissions');
  const tFields = useTranslations('admin.permissions.fields');
  const tCommon = useTranslations('common');
  const { data: permissions = [], isLoading } = usePermissions();
  const mutations = usePermissionMutations();

  const crud = useCrudResource<PermissionWithRelations>({
    resource: 'permission',
    onDelete: async (item) => {
      await mutations.remove.mutateAsync(item.id);
    },
    deleteConfirm: {
      title: t('deleteTitle'),
      description: t('deleteDescription'),
    },
  });

  const submit = async (values: PermissionInput) => {
    if (crud.selected) {
      await mutations.update.mutateAsync({ id: crud.selected.id, data: values });
    } else {
      await mutations.create.mutateAsync(values);
    }
    crud.closeForm();
  };

  const columns = useMemo<ColumnDef<PermissionWithRelations>[]>(
    () => [
      {
        id: 'resource',
        header: tFields('resource'),
        cell: ({ row }) => row.original.resource?.name ?? '—',
      },
      {
        id: 'target',
        header: tFields('target'),
        accessorKey: 'target',
        cell: ({ row }) => (
          <Badge variant="secondary" className="rounded-md">
            {row.original.target}
          </Badge>
        ),
      },
      {
        id: 'targetName',
        header: tFields('user'),
        cell: ({ row }) => {
          const record = row.original;
          if (record.user) {
            return (
              `${record.user.email}` || record.user.id
            );
          }
          if (record.role) return record.role.name;
          if (record.organization) return record.organization.name;
          return '—';
        },
      },
      {
        id: 'actions',
        header: tFields('actions'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.actions?.map((item) => (
              <Badge key={item.action.id} variant="outline" className="rounded-md">
                {item.action.name}
              </Badge>
            ))}
          </div>
        ),
      },
    ],
    [tFields]
  );

  return (
    <>
      <div className="flex justify-end pb-3">
        <PermissionButton resource="permission" action="create" onClick={crud.openCreate}>
          <PlusIcon />
          {t('createPermission')}
        </PermissionButton>
      </div>
      <DataGrid<PermissionWithRelations>
        data={permissions}
        columns={columns}
        loading={isLoading}
        columnVisibilityStorageKey="admin-permissions"
        exportFileName="permissions"
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
      />
      <CrudSheet
        open={crud.isFormOpen}
        onOpenChange={(open) => {
          if (!open) crud.closeForm();
        }}
        title={crud.selected ? tCommon('edit') : t('createPermission')}
      >
        <PermissionForm
          key={crud.selected?.id ?? 'new'}
          initialValues={crud.selected}
          onSubmit={submit}
        />
      </CrudSheet>
    </>
  );
}

function ResourcesTab() {
  const t = useTranslations('admin.permissions');
  const tCommon = useTranslations('common');
  const { data: resources = [], isLoading } = useResources();
  const mutations = useResourceMutations();

  const crud = useCrudResource<Resource>({
    resource: 'resource',
    onDelete: async (item) => {
      await mutations.remove.mutateAsync(item.id);
    },
    deleteConfirm: {
      title: t('deleteTitle'),
      description: t('deleteDescription'),
    },
  });

  const submit = async (values: ResourceInput) => {
    if (crud.selected) {
      await mutations.update.mutateAsync({ id: crud.selected.id, data: values });
    } else {
      await mutations.create.mutateAsync(values);
    }
    crud.closeForm();
  };

  const columns = useMemo<ColumnDef<Resource>[]>(
    () => [
      { id: 'name', header: tCommon('name'), accessorKey: 'name' },
      { id: 'slug', header: tCommon('slug'), accessorKey: 'slug' },
      { id: 'description', header: tCommon('description'), accessorKey: 'description' },
    ],
    [tCommon]
  );

  return (
    <>
      <div className="flex justify-end pb-3">
        <PermissionButton resource="resource" action="create" onClick={crud.openCreate}>
          <PlusIcon />
          {t('createResource')}
        </PermissionButton>
      </div>
      <DataGrid<Resource>
        data={resources}
        columns={columns}
        loading={isLoading}
        columnVisibilityStorageKey="admin-resources"
        exportFileName="resources"
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
      />
      <CrudSheet
        open={crud.isFormOpen}
        onOpenChange={(open) => {
          if (!open) crud.closeForm();
        }}
        title={crud.selected ? tCommon('edit') : t('createResource')}
      >
        <ResourceForm
          key={crud.selected?.id ?? 'new'}
          initialValues={crud.selected}
          onSubmit={submit}
        />
      </CrudSheet>
    </>
  );
}

function ActionsTab() {
  const t = useTranslations('admin.permissions');
  const tCommon = useTranslations('common');
  const { data: actions = [], isLoading } = useActions();
  const mutations = useActionMutations();

  const crud = useCrudResource<Action>({
    resource: 'action',
    onDelete: async (item) => {
      await mutations.remove.mutateAsync(item.id);
    },
    deleteConfirm: {
      title: t('deleteTitle'),
      description: t('deleteDescription'),
    },
  });

  const submit = async (values: ActionInput) => {
    if (crud.selected) {
      await mutations.update.mutateAsync({ id: crud.selected.id, data: values });
    } else {
      await mutations.create.mutateAsync(values);
    }
    crud.closeForm();
  };

  const columns = useMemo<ColumnDef<Action>[]>(
    () => [
      { id: 'name', header: tCommon('name'), accessorKey: 'name' },
      { id: 'slug', header: tCommon('slug'), accessorKey: 'slug' },
      { id: 'description', header: tCommon('description'), accessorKey: 'description' },
    ],
    [tCommon]
  );

  return (
    <>
      <div className="flex justify-end pb-3">
        <PermissionButton resource="action" action="create" onClick={crud.openCreate}>
          <PlusIcon />
          {t('createAction')}
        </PermissionButton>
      </div>
      <DataGrid<Action>
        data={actions}
        columns={columns}
        loading={isLoading}
        columnVisibilityStorageKey="admin-actions"
        exportFileName="actions"
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
      />
      <CrudSheet
        open={crud.isFormOpen}
        onOpenChange={(open) => {
          if (!open) crud.closeForm();
        }}
        title={crud.selected ? tCommon('edit') : t('createAction')}
      >
        <ActionForm
          key={crud.selected?.id ?? 'new'}
          initialValues={crud.selected}
          onSubmit={submit}
        />
      </CrudSheet>
    </>
  );
}

export default function PermissionsPage() {
  const t = useTranslations('admin.permissions');

  return (
    <PageShell title={t('title')} description={t('description')}>
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <Tabs defaultValue="permissions">
            <TabsList>
              <TabsTrigger value="permissions">
                <KeyRoundIcon className="size-4" />
                {t('tabPermissions')}
              </TabsTrigger>
              <TabsTrigger value="resources">
                <LayersIcon className="size-4" />
                {t('tabResources')}
              </TabsTrigger>
              <TabsTrigger value="actions">
                <ZapIcon className="size-4" />
                {t('tabActions')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="permissions" className="mt-4">
              <PermissionsTab />
            </TabsContent>
            <TabsContent value="resources" className="mt-4">
              <ResourcesTab />
            </TabsContent>
            <TabsContent value="actions" className="mt-4">
              <ActionsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageShell>
  );
}
