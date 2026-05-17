'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCwIcon, ShieldCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { PageShell } from '@/components/layout';
import { useRbacMatrix, useRbacMatrixMutation } from '@/lib/query';

function grantKey(resourceId: string, actionId: string) {
  return `${resourceId}:${actionId}`;
}

export default function RbacMatrixPage() {
  const t = useTranslations('admin.rbac');
  const tCommon = useTranslations('common');

  const { data, isLoading, refetch } = useRbacMatrix();
  const mutation = useRbacMatrixMutation();
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (data?.roles?.length && !selectedRoleId) {
      setSelectedRoleId(data.roles[0]!.id);
    }
  }, [data, selectedRoleId]);

  const selectedRole = data?.roles.find((role) => role.id === selectedRoleId);
  const enabledGrants = useMemo(
    () =>
      new Set(
        (data?.grants ?? [])
          .filter((grant) => grant.roleId === selectedRoleId)
          .map((grant) => grantKey(grant.resourceId, grant.actionId))
      ),
    [data, selectedRoleId]
  );

  const toggleGrant = async (resourceId: string, actionId: string, enabled: boolean) => {
    if (!selectedRoleId) return;
    const key = grantKey(resourceId, actionId);
    setSavingKey(key);
    try {
      await mutation.mutateAsync({ roleId: selectedRoleId, resourceId, actionId, enabled });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCwIcon />
          {tCommon('next')}
        </Button>
      }
    >
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>
                {selectedRole
                  ? `${selectedRole.name}: ${enabledGrants.size}`
                  : t('selectRole')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {isLoading ? tCommon('loading') : `${data?.roles.length ?? 0} role`}
              </Badge>
              <Select
                value={selectedRoleId}
                onValueChange={(value) => setSelectedRoleId(value ?? '')}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={t('selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {data?.roles.map((role) => (
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
                  <TableHead className="min-w-56">{tCommon('name')}</TableHead>
                  {data?.actions.map((action) => (
                    <TableHead key={action.id} className="text-center">
                      {action.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.resources.map((resource) => (
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
    </PageShell>
  );
}
