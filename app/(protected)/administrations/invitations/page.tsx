'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { PageHeader } from '@/components/app/page-header';
import { deleteRequest, getRequest, postRequest } from '@/lib/apiClient';
import type { Organization, Role } from '@/db/types';

type InvitationRow = {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  role: Pick<Role, 'id' | 'name'> | null;
  organization: Pick<Organization, 'id' | 'name'> | null;
};

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('none');
  const [organizationId, setOrganizationId] = useState('none');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const loadData = async () => {
    const [invitationRows, roleRows, organizationRows] = await Promise.all([
      getRequest<InvitationRow[]>('/administrations/invitations'),
      getRequest<Role[]>('/administrations/roles'),
      getRequest<Organization[]>('/administrations/organizations'),
    ]);
    setInvitations(invitationRows);
    setRoles(roleRows);
    setOrganizations(organizationRows);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const createInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await postRequest<InvitationRow & { acceptUrl: string }>(
        '/administrations/invitations',
        {
          email,
          roleId: roleId === 'none' ? null : roleId,
          organizationId: organizationId === 'none' ? null : organizationId,
          expiresInDays,
        }
      );
      setAcceptUrl(response.acceptUrl);
      setEmail('');
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const revokeInvitation = async () => {
    if (!revokeId) return;
    await deleteRequest(`/administrations/invitations/${revokeId}`);
    setRevokeId(null);
    await loadData();
  };

  return (
    <>
      <PageHeader
        title="Invitations"
        description="Invite users into the starter workspace with scoped role and organization assignment."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            New invitation
          </Button>
        }
      />

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Invite queue</CardTitle>
          <CardDescription>Pending, accepted and revoked invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>{invitation.role?.name ?? 'No role'}</TableCell>
                    <TableCell>{invitation.organization?.name ?? 'No organization'}</TableCell>
                    <TableCell>
                      <Badge variant={invitation.status === 'PENDING' ? 'secondary' : 'outline'}>
                        {invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(invitation.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={invitation.status !== 'PENDING'}
                        onClick={() => setRevokeId(invitation.id)}
                        aria-label={`Revoke invitation for ${invitation.email}`}
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
            <DialogTitle>Create invitation</DialogTitle>
          </DialogHeader>
          <form onSubmit={createInvitation}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="inviteEmail">Email</FieldLabel>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select value={roleId} onValueChange={(value) => setRoleId(value ?? 'none')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">No role</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Organization</FieldLabel>
                <Select
                  value={organizationId}
                  onValueChange={(value) => setOrganizationId(value ?? 'none')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">No organization</SelectItem>
                      {organizations.map((organization) => (
                        <SelectItem key={organization.id} value={organization.id}>
                          {organization.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="expiresInDays">Expires in days</FieldLabel>
                <Input
                  id="expiresInDays"
                  type="number"
                  min={1}
                  max={90}
                  value={expiresInDays}
                  onChange={(event) => setExpiresInDays(Number(event.target.value))}
                />
              </Field>
              {acceptUrl && (
                <Card className="rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-base">Accept URL</CardTitle>
                    <CardDescription>
                      Use this link in dev or wire it to an email provider.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Input value={acceptUrl} readOnly />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(acceptUrl)}
                    >
                      <CopyIcon />
                    </Button>
                  </CardContent>
                </Card>
              )}
              <FieldDescription>
                Production email delivery can consume the returned accept URL.
              </FieldDescription>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create invitation'}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(revokeId)}
        title="Revoke invitation"
        description="The invitation link will stop working immediately."
        confirmLabel="Revoke"
        onConfirm={revokeInvitation}
        onOpenChange={(open) => !open && setRevokeId(null)}
      />
    </>
  );
}
