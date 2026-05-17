'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { invitationsApi, type InvitationCreateInput, type ListParams } from '@/lib/api/client';

export function useInvitations(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.invitations.list(params),
    queryFn: () => invitationsApi.list(params),
  });
}

export function useInvitationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.invitations.all });

  return {
    create: useMutation({
      mutationFn: (data: InvitationCreateInput) => invitationsApi.create(data),
      onSuccess: invalidate,
    }),
    revoke: useMutation({
      mutationFn: (id: string) => invitationsApi.revoke(id),
      onSuccess: invalidate,
    }),
  };
}
