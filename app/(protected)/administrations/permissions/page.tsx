'use client';

import { useEffect, useState } from 'react';
import { EditIcon, KeyRoundIcon, LayersIcon, PlusIcon, Trash2Icon, ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { EntityActions } from '@/components/app/entity-actions';
import { PageHeader } from '@/components/app/page-header';
import { usePermission } from '@/lib/auth/client-permissions';
import { DataGrid } from '@/core/components/datagrid';
import { Permission, Resource, Action } from '@/db/types';
import { getRequest, postRequest, putRequest, deleteRequest } from '@/lib/apiClient';
import { PermissionForm, PermissionFormData } from './components/permission-form';
import { ResourceForm, ResourceFormData } from './components/resource-form';
import { ActionForm, ActionFormData } from './components/action-form';

interface PermissionWithRelations extends Permission {
  resource: Resource;
  actions: {
    action: Action;
  }[];
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  role?: {
    id: string;
    name: string;
    organizationId: string | null;
  } | null;
  organization?: {
    id: string;
    name: string;
  } | null;
}

type ActiveTab = 'permissions' | 'resources' | 'actions';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionWithRelations[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('permissions');
  const [permissionDrawerVisible, setPermissionDrawerVisible] = useState(false);
  const [resourceDrawerVisible, setResourceDrawerVisible] = useState(false);
  const [actionDrawerVisible, setActionDrawerVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionWithRelations | null>(
    null
  );
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'permission' | 'resource' | 'action';
    id: string;
  } | null>(null);

  const canCreatePermission = usePermission('permission', 'create');
  const canEditPermission = usePermission('permission', 'edit');
  const canDeletePermission = usePermission('permission', 'delete');
  const canCreateResource = usePermission('resource', 'create');
  const canEditResource = usePermission('resource', 'edit');
  const canDeleteResource = usePermission('resource', 'delete');
  const canCreateAction = usePermission('action', 'create');
  const canEditAction = usePermission('action', 'edit');
  const canDeleteAction = usePermission('action', 'delete');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'permissions') {
        setPermissions(await getRequest<PermissionWithRelations[]>('/administrations/permissions'));
      } else if (activeTab === 'resources') {
        setResources(await getRequest<Resource[]>('/administrations/resources'));
      } else {
        setActions(await getRequest<Action[]>('/administrations/actions'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const closeDrawers = () => {
    setPermissionDrawerVisible(false);
    setResourceDrawerVisible(false);
    setActionDrawerVisible(false);
    setSelectedPermission(null);
    setSelectedResource(null);
    setSelectedAction(null);
  };

  const handleSubmit = async (values: PermissionFormData | ResourceFormData | ActionFormData) => {
    setFormLoading(true);
    try {
      const endpoint =
        activeTab === 'permissions'
          ? selectedPermission
            ? `/administrations/permissions/${selectedPermission.id}`
            : '/administrations/permissions'
          : activeTab === 'resources'
            ? selectedResource
              ? `/administrations/resources/${selectedResource.id}`
              : '/administrations/resources'
            : selectedAction
              ? `/administrations/actions/${selectedAction.id}`
              : '/administrations/actions';

      if (selectedPermission || selectedResource || selectedAction) {
        await putRequest(endpoint, values);
      } else {
        await postRequest(endpoint, values);
      }

      closeDrawers();
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteRequest(`/administrations/${itemToDelete.type}s/${itemToDelete.id}`);
      setDeleteModalVisible(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const permissionColumns = [
    {
      title: '',
      key: 'actions',
      width: 72,
      render: (record: PermissionWithRelations) => (
        <EntityActions
          actions={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              disabled: !canEditPermission,
              onSelect: () => {
                setSelectedPermission(record);
                setPermissionDrawerVisible(true);
              },
            },
            {
              label: 'Delete',
              icon: <Trash2Icon />,
              destructive: true,
              disabled: !canDeletePermission,
              onSelect: () => {
                setItemToDelete({ type: 'permission', id: record.id });
                setDeleteModalVisible(true);
              },
            },
          ]}
        />
      ),
    },
    {
      title: 'Resource',
      key: 'resource',
      render: (record: PermissionWithRelations) => record.resource.name,
    },
    {
      title: 'Target',
      key: 'targetName',
      render: (record: PermissionWithRelations) => {
        if (record.user)
          return (
            `${record.user.firstName ?? ''} ${record.user.lastName ?? ''}`.trim() ||
            record.user.email
          );
        if (record.role)
          return `${record.role.name}${record.role.organizationId ? ' (Organization)' : ' (Global)'}`;
        if (record.organization) return record.organization.name;
        return '-';
      },
    },
    {
      title: 'Type',
      dataIndex: 'target',
      key: 'target',
      render: (target: string) => (
        <Badge variant="secondary" className="rounded-md">
          {target}
        </Badge>
      ),
    },
    {
      title: 'Actions',
      key: 'permissionActions',
      render: (record: PermissionWithRelations) => (
        <div className="flex flex-wrap gap-1">
          {record.actions.map((permissionAction) => (
            <Badge key={permissionAction.action.id} variant="outline" className="rounded-md">
              {permissionAction.action.name}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  const resourceColumns = [
    {
      title: '',
      key: 'actions',
      width: 72,
      render: (record: Resource) => (
        <EntityActions
          actions={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              disabled: !canEditResource,
              onSelect: () => {
                setSelectedResource(record);
                setResourceDrawerVisible(true);
              },
            },
            {
              label: 'Delete',
              icon: <Trash2Icon />,
              destructive: true,
              disabled: !canDeleteResource,
              onSelect: () => {
                setItemToDelete({ type: 'resource', id: record.id });
                setDeleteModalVisible(true);
              },
            },
          ]}
        />
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const actionColumns = [
    {
      title: '',
      key: 'actions',
      width: 72,
      render: (record: Action) => (
        <EntityActions
          actions={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              disabled: !canEditAction,
              onSelect: () => {
                setSelectedAction(record);
                setActionDrawerVisible(true);
              },
            },
            {
              label: 'Delete',
              icon: <Trash2Icon />,
              destructive: true,
              disabled: !canDeleteAction,
              onSelect: () => {
                setItemToDelete({ type: 'action', id: record.id });
                setDeleteModalVisible(true);
              },
            },
          ]}
        />
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Manage resource access through permissions, resources and reusable actions."
      />

      <Card className="rounded-lg">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="permissions">
                  <KeyRoundIcon className="size-4" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <LayersIcon className="size-4" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="actions">
                  <ZapIcon className="size-4" />
                  Actions
                </TabsTrigger>
              </TabsList>

              {activeTab === 'permissions' && canCreatePermission && (
                <Button onClick={() => setPermissionDrawerVisible(true)}>
                  <PlusIcon data-icon="inline-start" />
                  Create permission
                </Button>
              )}
              {activeTab === 'resources' && canCreateResource && (
                <Button onClick={() => setResourceDrawerVisible(true)}>
                  <PlusIcon data-icon="inline-start" />
                  Create resource
                </Button>
              )}
              {activeTab === 'actions' && canCreateAction && (
                <Button onClick={() => setActionDrawerVisible(true)}>
                  <PlusIcon data-icon="inline-start" />
                  Create action
                </Button>
              )}
            </div>

            <TabsContent value="permissions" className="mt-4">
              <DataGrid<PermissionWithRelations>
                columns={permissionColumns}
                dataSource={permissions}
                loading={loading}
                rowKey="id"
                onRowDoubleClick={
                  canEditPermission
                    ? (record) => {
                        setSelectedPermission(record);
                        setPermissionDrawerVisible(true);
                      }
                    : undefined
                }
              />
            </TabsContent>
            <TabsContent value="resources" className="mt-4">
              <DataGrid<Resource>
                columns={resourceColumns}
                dataSource={resources}
                loading={loading}
                rowKey="id"
                onRowDoubleClick={
                  canEditResource
                    ? (record) => {
                        setSelectedResource(record);
                        setResourceDrawerVisible(true);
                      }
                    : undefined
                }
              />
            </TabsContent>
            <TabsContent value="actions" className="mt-4">
              <DataGrid<Action>
                columns={actionColumns}
                dataSource={actions}
                loading={loading}
                rowKey="id"
                onRowDoubleClick={
                  canEditAction
                    ? (record) => {
                        setSelectedAction(record);
                        setActionDrawerVisible(true);
                      }
                    : undefined
                }
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Sheet open={permissionDrawerVisible} onOpenChange={(open) => !open && closeDrawers()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedPermission ? 'Edit permission' : 'Create permission'}</SheetTitle>
            <SheetDescription>Connect a resource, target and allowed actions.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <PermissionForm
              initialValues={selectedPermission}
              onSubmit={handleSubmit}
              loading={formLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={resourceDrawerVisible} onOpenChange={(open) => !open && closeDrawers()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedResource ? 'Edit resource' : 'Create resource'}</SheetTitle>
            <SheetDescription>
              Resources represent protected areas of the application.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <ResourceForm
              initialValues={selectedResource}
              onSubmit={handleSubmit}
              loading={formLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={actionDrawerVisible} onOpenChange={(open) => !open && closeDrawers()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedAction ? 'Edit action' : 'Create action'}</SheetTitle>
            <SheetDescription>
              Actions define operations such as view, create, edit and delete.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <ActionForm
              initialValues={selectedAction}
              onSubmit={handleSubmit}
              loading={formLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteModalVisible}
        title={`Delete ${itemToDelete?.type ?? 'item'}`}
        description={`Are you sure you want to delete this ${itemToDelete?.type ?? 'item'}? This action cannot be undone.`}
        loading={formLoading}
        onOpenChange={(open) => {
          setDeleteModalVisible(open);
          if (!open) setItemToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
