'use client';

import { useMemo, useState } from 'react';
import { CopyIcon, KeyRoundIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { DataGrid } from '@/components/data-grid';
import { PageShell, CrudSheet } from '@/components/layout';
import { PermissionButton } from '@/components/permission';
import {
  Form,
  FormInput,
  SubmitButton,
} from '@/components/forms';
import { useClipboard, useCrudResource } from '@/lib/hooks';
import { useApiKeys, useApiKeyMutations } from '@/lib/query';
import { formatRelative } from '@/lib/formatters';
import type { ApiKeyCreateInput, ApiKeyListItem } from '@/lib/api/client';

type FormValues = {
  name: string;
  scopesText: string;
  expiresAt: string;
};

const formSchema = z.object({
  name: z.string().trim().min(3),
  scopesText: z.string(),
  expiresAt: z.string(),
}) as unknown as z.ZodType<FormValues>;

export default function ApiKeysPage() {
  const t = useTranslations('admin.apiKeys');
  const tCommon = useTranslations('common');
  const { data: apiKeys = [], isLoading } = useApiKeys();
  const mutations = useApiKeyMutations();
  const { copy, copied } = useClipboard();

  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const crud = useCrudResource<ApiKeyListItem>({
    resource: 'api-key',
    onDelete: async (apiKey) => {
      await mutations.revoke.mutateAsync(apiKey.id);
    },
    deleteConfirm: {
      title: t('revokeTitle'),
      description: t('revokeDescription'),
    },
  });

  const submit = async (values: FormValues) => {
    const payload: ApiKeyCreateInput = {
      name: values.name,
      scopes: values.scopesText
        .split(',')
        .map((scope) => scope.trim())
        .filter(Boolean),
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
    };
    // bypass strict typing; values from form differ slightly from API schema
    const response = await mutations.create.mutateAsync(payload as never);
    setCreatedKey(response.key);
  };

  const columns = useMemo<ColumnDef<ApiKeyListItem>[]>(
    () => [
      {
        id: 'name',
        header: t('columns.name'),
        accessorKey: 'name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: 'prefix',
        header: t('columns.prefix'),
        accessorKey: 'keyPrefix',
      },
      {
        id: 'scopes',
        header: t('columns.scopes'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.scopes?.map((scope) => (
              <Badge key={scope} variant="outline" className="rounded-md">
                {scope}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'status',
        header: t('columns.lastUsed'),
        cell: ({ row }) => (
          <Badge variant={row.original.revokedAt ? 'destructive' : 'secondary'}>
            {row.original.revokedAt ? 'Revoked' : 'Active'}
          </Badge>
        ),
      },
      {
        id: 'lastUsedAt',
        header: t('columns.lastUsed'),
        cell: ({ row }) =>
          row.original.lastUsedAt ? formatRelative(row.original.lastUsedAt) : '—',
      },
    ],
    [t]
  );

  const defaultValues: FormValues = {
    name: '',
    scopesText: 'user:read,organization:read',
    expiresAt: '',
  };

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <PermissionButton
          resource="api-key"
          action="create"
          onClick={() => {
            setCreatedKey(null);
            crud.openCreate();
          }}
        >
          <PlusIcon />
          {t('createButton')}
        </PermissionButton>
      }
    >
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <DataGrid<ApiKeyListItem>
            data={apiKeys}
            columns={columns}
            loading={isLoading}
            columnVisibilityStorageKey="admin-api-keys"
            exportFileName="api-keys"
            toolbar={{ search: true, columnVisibility: true, exportable: true }}
            rowActions={(record) => [
              {
                label: t('revoke'),
                icon: <Trash2Icon />,
                destructive: true,
                disabled: () => Boolean(record.revokedAt) || !crud.permissions.canDelete,
                onSelect: (item) => {
                  void crud.confirmDelete(item);
                },
              },
            ]}
          />
        </CardContent>
      </Card>

      <CrudSheet
        open={crud.isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            crud.closeForm();
            setCreatedKey(null);
          }
        }}
        title={t('createTitle')}
        description={t('createDescription')}
      >
        <Form<FormValues>
          schema={formSchema}
          defaultValues={defaultValues as never}
          onSubmit={submit}
        >
          <FormInput name="name" label={tCommon('name')} />
          <FormInput
            name="scopesText"
            label={t('scopesLabel')}
            description={t('scopesLabel')}
          />
          <FormInput
            name="expiresAt"
            type="datetime-local"
            label={t('expiresAtLabel')}
          />
          {createdKey && (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRoundIcon />
                  {t('createTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Field>
                  <FieldLabel>{tCommon('copy')}</FieldLabel>
                  <div className="flex gap-2">
                    <code className="block flex-1 break-all rounded-lg bg-muted p-3 text-sm">
                      {createdKey}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copy(createdKey)}
                      aria-label={tCommon('copy')}
                    >
                      <CopyIcon />
                    </Button>
                  </div>
                  <FieldDescription>{t('secretShown')}</FieldDescription>
                  {copied && (
                    <p className="text-xs text-muted-foreground">{tCommon('copied')}</p>
                  )}
                </Field>
              </CardContent>
            </Card>
          )}
          <SubmitButton className="w-full">{t('createButton')}</SubmitButton>
        </Form>
      </CrudSheet>
    </PageShell>
  );
}
