'use client';

import { useEffect, useState } from 'react';
import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { EntityActions } from '@/components/app/entity-actions';
import { PageHeader } from '@/components/app/page-header';
import { usePermission } from '@/lib/auth/client-permissions';
import { DataGrid } from '@/core/components/datagrid';
import { Role } from '@/db/types';
import { getRequest, postRequest, putRequest, deleteRequest } from '@/lib/apiClient';
import { RoleForm, RoleFormData } from './components/role-form';

interface RoleWithRelations extends Role {
  organization?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    userRoles: number;
  };
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithRelations | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithRelations | null>(null);
  const canCreate = usePermission('role', 'create');
  const canEdit = usePermission('role', 'edit');
  const canDelete = usePermission('role', 'delete');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getRequest<RoleWithRelations[]>('/administrations/roles');
      setRoles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRequest(`/administrations/roles/${roleToDelete.id}`);
      setDeleteModalVisible(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (values: RoleFormData) => {
    setFormLoading(true);
    try {
      const endpoint = selectedRole
        ? `/administrations/roles/${selectedRole.id}`
        : '/administrations/roles';

      if (selectedRole) {
        await putRequest(endpoint, values);
      } else {
        await postRequest(endpoint, values);
      }

      setDrawerVisible(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      title: '',
      key: 'actions',
      width: 72,
      render: (record: RoleWithRelations) => (
        <EntityActions
          actions={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              disabled: !canEdit,
              onSelect: () => {
                setSelectedRole(record);
                setDrawerVisible(true);
              },
            },
            {
              label: 'Delete',
              icon: <Trash2Icon />,
              destructive: true,
              disabled: !canDelete,
              onSelect: () => {
                setRoleToDelete(record);
                setDeleteModalVisible(true);
              },
            },
          ]}
        />
      ),
    },
    {
      title: 'Role',
      key: 'name',
      render: (record: RoleWithRelations) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="max-w-md truncate text-xs text-muted-foreground">
            {record.description || 'No description'}
          </div>
        </div>
      ),
    },
    {
      title: 'Scope',
      key: 'organization',
      render: (record: RoleWithRelations) => record.organization?.name || 'Global',
    },
    {
      title: 'Default',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) =>
        isDefault ? (
          <Badge variant="secondary" className="rounded-md">
            Default
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      title: 'Users',
      key: 'userRoles',
      render: (record: RoleWithRelations) => record._count?.userRoles ?? 0,
    },
  ];

  return (
    <>
      <PageHeader
        title="Roles"
        description="Define global and organization-scoped roles for the starter permission model."
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setSelectedRole(null);
                setDrawerVisible(true);
              }}
            >
              <PlusIcon data-icon="inline-start" />
              Create role
            </Button>
          )
        }
      />

      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<RoleWithRelations>
            columns={columns}
            dataSource={roles}
            loading={loading}
            rowKey="id"
            onRowDoubleClick={
              canEdit
                ? (record) => {
                    setSelectedRole(record);
                    setDrawerVisible(true);
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <Sheet
        open={drawerVisible}
        onOpenChange={(open) => {
          setDrawerVisible(open);
          if (!open) setSelectedRole(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedRole ? 'Edit role' : 'Create role'}</SheetTitle>
            <SheetDescription>
              {selectedRole
                ? 'Update role scope and default behavior.'
                : 'Create a reusable access role.'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <RoleForm initialValues={selectedRole} onSubmit={handleSubmit} loading={formLoading} />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteModalVisible}
        title="Delete role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        loading={formLoading}
        onOpenChange={(open) => {
          setDeleteModalVisible(open);
          if (!open) setRoleToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
