'use client';

import { useEffect, useState } from 'react';
import { EditIcon, PlusIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
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
import { StatusBadge } from '@/components/app/status-badge';
import { usePermission } from '@/lib/auth/client-permissions';
import { DataGrid } from '@/core/components/datagrid';
import { Organization, OrgStatus } from '@/db/types';
import { getRequest, deleteRequest, postRequest, putRequest } from '@/lib/apiClient';
import { AddUsersDrawer } from './components/add-users-drawer';
import { OrganizationForm, OrganizationFormData } from './components/organization-form';

type OrganizationWithCount = Organization & {
  _count?: {
    members: number;
  };
  children?: OrganizationWithCount[];
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addUsersDrawerOpen, setAddUsersDrawerOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithCount | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<OrganizationWithCount | null>(null);
  const canCreate = usePermission('organization', 'create');
  const canEdit = usePermission('organization', 'edit');
  const canDelete = usePermission('organization', 'delete');
  const canAddUsers = usePermission('organization', 'edit');

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await getRequest<OrganizationWithCount[]>('/administrations/organizations');
      setOrganizations(data.filter((org) => !org.parentId));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDelete = async () => {
    if (!orgToDelete) return;

    try {
      await deleteRequest(`/administrations/organizations/${orgToDelete.id}`);
      setDeleteModalVisible(false);
      setOrgToDelete(null);
      fetchOrganizations();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (values: OrganizationFormData) => {
    setFormLoading(true);
    try {
      if (selectedOrg) {
        await putRequest(`/administrations/organizations/${selectedOrg.id}`, values);
      } else {
        await postRequest('/administrations/organizations', values);
      }

      setDrawerVisible(false);
      setSelectedOrg(null);
      fetchOrganizations();
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
      render: (record: OrganizationWithCount) => (
        <EntityActions
          actions={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              disabled: !canEdit,
              onSelect: () => {
                setSelectedOrg(record);
                setDrawerVisible(true);
              },
            },
            {
              label: 'Add users',
              icon: <UserPlusIcon />,
              disabled: !canAddUsers,
              onSelect: () => {
                setSelectedOrg(record);
                setAddUsersDrawerOpen(true);
              },
            },
            {
              label: 'Delete',
              icon: <Trash2Icon />,
              destructive: true,
              disabled: !canDelete,
              onSelect: () => {
                setOrgToDelete(record);
                setDeleteModalVisible(true);
              },
            },
          ]}
        />
      ),
    },
    {
      title: 'Organization',
      key: 'name',
      render: (record: OrganizationWithCount) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-xs text-muted-foreground">{record.slug}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrgStatus) => <StatusBadge status={status} />,
    },
    {
      title: 'Members',
      key: 'members',
      render: (record: OrganizationWithCount) => record._count?.members ?? 0,
    },
  ];

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Manage organization hierarchy, membership and workspace status."
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setSelectedOrg(null);
                setDrawerVisible(true);
              }}
            >
              <PlusIcon data-icon="inline-start" />
              Create organization
            </Button>
          )
        }
      />

      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<OrganizationWithCount>
            columns={columns}
            dataSource={organizations}
            loading={loading}
            rowKey={(record) => `org-${record.id}`}
            expandable={{
              defaultExpandAllRows: true,
              childrenColumnName: 'children',
            }}
            onRowDoubleClick={
              canEdit
                ? (record) => {
                    setSelectedOrg(record);
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
          if (!open) setSelectedOrg(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedOrg ? 'Edit organization' : 'Create organization'}</SheetTitle>
            <SheetDescription>
              {selectedOrg
                ? 'Update workspace identity and hierarchy.'
                : 'Add a new workspace node.'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <OrganizationForm
              initialValues={selectedOrg || undefined}
              onSubmit={handleSubmit}
              loading={formLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AddUsersDrawer
        organization={selectedOrg}
        open={addUsersDrawerOpen}
        onClose={() => {
          setAddUsersDrawerOpen(false);
          setSelectedOrg(null);
        }}
      />

      <ConfirmDialog
        open={deleteModalVisible}
        title="Delete organization"
        description="Are you sure you want to delete this organization? This action cannot be undone."
        onOpenChange={(open) => {
          setDeleteModalVisible(open);
          if (!open) setOrgToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
