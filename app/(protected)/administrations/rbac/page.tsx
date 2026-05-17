'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCwIcon, ShieldCheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/app/page-header';
import { getRequest, putRequest } from '@/lib/apiClient';
import type { Action, Resource, Role } from '@/db/types';

type Grant = {
  roleId: string | null;
  resourceId: string;
  actionId: string;
};

type MatrixResponse = {
  roles: Role[];
  resources: Resource[];
  actions: Action[];
  grants: Grant[];
};

function grantKey(resourceId: string, actionId: string) {
  return `${resourceId}:${actionId}`;
}

export default function RbacMatrixPage() {
  const [data, setData] = useState<MatrixResponse>({
    roles: [],
    resources: [],
    actions: [],
    grants: [],
  });
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getRequest<MatrixResponse>('/administrations/rbac-matrix');
      setData(response);
      setSelectedRoleId((current) => current || response.roles[0]?.id || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const selectedRole = data.roles.find((role) => role.id === selectedRoleId);
  const enabledGrants = useMemo(() => {
    return new Set(
      data.grants
        .filter((grant) => grant.roleId === selectedRoleId)
        .map((grant) => grantKey(grant.resourceId, grant.actionId))
    );
  }, [data.grants, selectedRoleId]);

  const toggleGrant = async (resourceId: string, actionId: string, enabled: boolean) => {
    if (!selectedRoleId) return;

    const key = grantKey(resourceId, actionId);
    setSavingKey(key);
    try {
      await putRequest('/administrations/rbac-matrix', {
        roleId: selectedRoleId,
        resourceId,
        actionId,
        enabled,
      });
      setData((current) => {
        const nextGrants = current.grants.filter(
          (grant) =>
            !(
              grant.roleId === selectedRoleId &&
              grant.resourceId === resourceId &&
              grant.actionId === actionId
            )
        );
        if (enabled) nextGrants.push({ roleId: selectedRoleId, resourceId, actionId });
        return { ...current, grants: nextGrants };
      });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <>
      <PageHeader
        title="RBAC matrix"
        description="Manage role permissions as a resource by action matrix."
        actions={
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCwIcon data-icon="inline-start" />
            Refresh
          </Button>
        }
      />

      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Role permissions</CardTitle>
              <CardDescription>
                {selectedRole
                  ? `${selectedRole.name} has ${enabledGrants.size} explicit grant(s).`
                  : 'Select a role to edit grants.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {loading ? 'Loading' : `${data.roles.length} roles`}
              </Badge>
              <Select
                value={selectedRoleId}
                onValueChange={(value) => setSelectedRoleId(value ?? '')}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {data.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-56">Resource</TableHead>
                  {data.actions.map((action) => (
                    <TableHead key={action.id} className="text-center">
                      {action.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                          <ShieldCheckIcon />
                        </div>
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-xs text-muted-foreground">{resource.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    {data.actions.map((action) => {
                      const key = grantKey(resource.id, action.id);
                      const checked = enabledGrants.has(key);
                      return (
                        <TableCell key={action.id} className="text-center">
                          <Checkbox
                            checked={checked}
                            disabled={!selectedRoleId || savingKey === key}
                            onCheckedChange={(value) =>
                              toggleGrant(resource.id, action.id, Boolean(value))
                            }
                            aria-label={`${resource.name} ${action.name}`}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
