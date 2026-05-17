'use client';

import { FormEvent, useEffect, useState } from 'react';
import { KeyRoundIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { PageHeader } from '@/components/app/page-header';
import { deleteRequest, getRequest, postRequest } from '@/lib/apiClient';

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdBy: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState('user:read,organization:read');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const loadApiKeys = async () => {
    setApiKeys(await getRequest<ApiKeyRow[]>('/administrations/api-keys'));
  };

  useEffect(() => {
    loadApiKeys().catch(console.error);
  }, []);

  const createApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await postRequest<ApiKeyRow & { key: string }>('/administrations/api-keys', {
        name,
        scopes: scopes
          .split(',')
          .map((scope) => scope.trim())
          .filter(Boolean),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setCreatedKey(response.key);
      setName('');
      setScopes('user:read,organization:read');
      setExpiresAt('');
      await loadApiKeys();
    } finally {
      setSaving(false);
    }
  };

  const revokeApiKey = async () => {
    if (!revokeId) return;
    await deleteRequest(`/administrations/api-keys/${revokeId}`);
    setRevokeId(null);
    await loadApiKeys();
  };

  return (
    <>
      <PageHeader
        title="API keys"
        description="Create scoped service credentials for integrations and automation."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            New key
          </Button>
        }
      />

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Service credentials</CardTitle>
          <CardDescription>
            Keys are hashed at rest and the secret is shown only once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>{apiKey.keyPrefix}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.scopes.map((scope) => (
                          <Badge key={scope} variant="outline">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={apiKey.revokedAt ? 'destructive' : 'secondary'}>
                        {apiKey.revokedAt ? 'Revoked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={Boolean(apiKey.revokedAt)}
                        onClick={() => setRevokeId(apiKey.id)}
                        aria-label={`Revoke ${apiKey.name}`}
                      >
                        <Trash2Icon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
          </DialogHeader>
          <form onSubmit={createApiKey}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="apiKeyName">Name</FieldLabel>
                <Input
                  id="apiKeyName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="apiKeyScopes">Scopes</FieldLabel>
                <Input
                  id="apiKeyScopes"
                  value={scopes}
                  onChange={(event) => setScopes(event.target.value)}
                />
                <FieldDescription>Comma-separated scope names.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="apiKeyExpiry">Expires at</FieldLabel>
                <Input
                  id="apiKeyExpiry"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              </Field>
              {createdKey && (
                <Card className="rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <KeyRoundIcon />
                      Secret key
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="block break-all rounded-lg bg-muted p-3 text-sm">
                      {createdKey}
                    </code>
                  </CardContent>
                </Card>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create key'}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(revokeId)}
        title="Revoke API key"
        description="This service credential will stop working immediately."
        confirmLabel="Revoke"
        onConfirm={revokeApiKey}
        onOpenChange={(open) => !open && setRevokeId(null)}
      />
    </>
  );
}
