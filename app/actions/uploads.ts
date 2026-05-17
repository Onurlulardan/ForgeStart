'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { failure, parseJson, success, withAuth } from '@/lib/actions';
import { deleteUpload } from '@/lib/storage/service';

const deleteUploadSchema = z.object({ uploadId: z.string().uuid() });

export const deleteUploadAction = withAuth(async (session, input: unknown) => {
  const parsed = parseJson(deleteUploadSchema, input);
  if (!parsed.ok) return parsed;

  const ok = await deleteUpload(parsed.data.uploadId, session.user.id);
  if (!ok) return failure('Upload not found', 'NOT_FOUND');
  revalidatePath('/administrations/users/profile/edit');
  return success({ deleted: true });
});
