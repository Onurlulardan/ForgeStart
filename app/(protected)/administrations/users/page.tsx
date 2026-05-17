'use client';

import { useEffect, useState } from 'react';
import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { StatusBadge } from '@/components/app/status-badge';
import { usePermission } from '@/lib/auth/client-permissions';
import { DataGrid } from '@/core/components/datagrid';
import { User, UserStatus } from '@/db/types';
import { getRequest, postRequest, putRequest, deleteRequest } from '@/lib/apiClient';
import { UserForm, UserFormData } from './components/user-form';

type Role = {
  id: string;
  name: string;
  description: string | null;
};

type UserRole = {
  role: Role;
};

type UserWithoutPassword = Omit<User, 'passwordHash'> & {
  userRoles?: UserRole[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithoutPassword | null>(null);
  const canCreate = usePermission('user', 'create');
  const canEdit = usePermission('user', 'edit');
  const canDelete = usePermission('user', 'delete');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getRequest<UserWithoutPassword[]>('/administrations/users');
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteRequest(`/administrations/users/${userToDelete.id}`);
      setDeleteModalVisible(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (values: UserFormData) => {
    setFormLoading(true);
    try {
      const endpoint = selectedUser
        ? `/administrations/users/${selectedUser.id}`
        : '/administrations/users';

      if (selectedUser) {
        await putRequest(endpoint, values);
      } else {
        await postRequest(endpoint, values);
      }

      setDrawerVisible(false);
      setSelectedUser(null);
      fetchUsers();
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
      render: (record: UserWithoutPassword) => (
        <EntityActions
          actions={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              disabled: !canEdit,
              onSelect: () => {
                setSelectedUser(record);
                setDrawerVisible(true);
              },
            },
            {
              label: 'Delete',
              icon: <Trash2Icon />,
              destructive: true,
              disabled: !canDelete,
              onSelect: () => {
                setUserToDelete(record);
                setDeleteModalVisible(true);
              },
            },
          ]}
        />
      ),
    },
    {
      title: 'Name',
      key: 'name',
      render: (record: UserWithoutPassword) => {
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
      title: 'Roles',
      key: 'roles',
      render: (record: UserWithoutPassword) => (
        <div className="flex flex-wrap gap-1">
          {record.userRoles?.length ? (
            record.userRoles.map((userRole) => (
              <Badge key={userRole.role.id} variant="secondary" className="rounded-md">
                {userRole.role.name}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="rounded-md">
              No role
            </Badge>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => <StatusBadge status={status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user identities, role assignments and account status."
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setSelectedUser(null);
                setDrawerVisible(true);
              }}
            >
              <PlusIcon data-icon="inline-start" />
              Create user
            </Button>
          )
        }
      />

      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<UserWithoutPassword>
            columns={columns}
            dataSource={users}
            rowKey="id"
            storageKey="admin-users"
            loading={loading}
            onRowDoubleClick={
              canEdit
                ? (record) => {
                    setSelectedUser(record);
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
          if (!open) setSelectedUser(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedUser ? 'Edit user' : 'Create user'}</SheetTitle>
            <SheetDescription>
              {selectedUser
                ? 'Update account profile, roles and status.'
                : 'Create a user and assign starter roles.'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <UserForm
              initialValues={
                selectedUser
                  ? {
                      ...selectedUser,
                      userRoles: selectedUser.userRoles,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              loading={formLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteModalVisible}
        title="Delete user"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {userToDelete
                ? [userToDelete.firstName, userToDelete.lastName].filter(Boolean).join(' ') ||
                  userToDelete.email
                : 'this user'}
            </span>
            ? This action cannot be undone.
          </>
        }
        onOpenChange={(open) => {
          setDeleteModalVisible(open);
          if (!open) setUserToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
