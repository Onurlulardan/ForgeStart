'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Organization, User } from '@/db/types';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { MultiSelectList } from '@/components/app/multi-select-list';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getRequest, postRequest } from '@/lib/apiClient';

interface AddUsersDrawerProps {
  organization: Organization | null;
  open: boolean;
  onClose: () => void;
}

export function AddUsersDrawer({ organization, open, onClose }: AddUsersDrawerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchAvailableUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await getRequest<User[]>('/administrations/users/available');
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAvailableUsers();
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization) return;

    try {
      setLoading(true);
      await postRequest(`/administrations/organizations/${organization.id}/add-users`, {
        userIds: selectedUserIds,
      });
      setSelectedUserIds([]);
      onClose();
    } catch (error) {
      console.error('Failed to add users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Add users to {organization?.name ?? 'organization'}</SheetTitle>
          <SheetDescription>Select existing users that are not already members.</SheetDescription>
        </SheetHeader>
        <form className="px-4 pb-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Users</FieldLabel>
              <MultiSelectList
                value={selectedUserIds}
                disabled={loadingUsers}
                emptyText={loadingUsers ? 'Loading users...' : 'No available users.'}
                options={users.map((user) => ({
                  value: user.id,
                  label: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
                  description: user.email,
                }))}
                onChange={setSelectedUserIds}
              />
            </Field>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || selectedUserIds.length === 0}
            >
              {loading ? 'Adding users...' : 'Add users'}
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  );
}
