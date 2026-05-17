'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { appSettings } from '@/db/schema';
import { failure, parseJson, success, withAuth } from '@/lib/actions';

const themeTokensSchema = z.object({
  radius: z.string(),
  fontFamily: z.string(),
  colors: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
});

const SETTING_KEY = 'theme.tokens';

export const saveSystemThemeAction = withAuth(
  async (session, input: unknown) => {
    const parsed = parseJson(themeTokensSchema, input);
    if (!parsed.ok) return parsed;

    const value = JSON.stringify(parsed.data);
    const existing = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, SETTING_KEY))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(appSettings)
        .set({ value, updatedById: session.user.id, updatedAt: new Date() })
        .where(eq(appSettings.key, SETTING_KEY));
    } else {
      await db.insert(appSettings).values({
        key: SETTING_KEY,
        value,
        label: 'Theme tokens',
        description: 'System-wide design tokens applied to all users.',
        isSecret: false,
        updatedById: session.user.id,
      });
    }

    revalidatePath('/administrations/system/theme');
    return success({ saved: true });
  },
  { permission: { resource: 'system', action: 'edit' } }
);

export const resetSystemThemeAction = withAuth(
  async () => {
    await db.delete(appSettings).where(eq(appSettings.key, SETTING_KEY));
    revalidatePath('/administrations/system/theme');
    return success({ reset: true });
  },
  { permission: { resource: 'system', action: 'edit' } }
);

export async function loadSystemTheme(): Promise<unknown | null> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, SETTING_KEY))
    .limit(1);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

// Avoid unused warning for failure import when unused
void failure;
