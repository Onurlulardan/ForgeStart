import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test as setup } from '@playwright/test';

const authFile = join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate super admin', async ({ page }) => {
  mkdirSync(dirname(authFile), { recursive: true });

  await page.goto('/auth/login');
  await page
    .getByLabel('Email')
    .fill(process.env.PLAYWRIGHT_USER_EMAIL ?? 'superadmin@example.com');
  await page
    .getByLabel('Password')
    .fill(process.env.PLAYWRIGHT_USER_PASSWORD ?? 'change-this-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: authFile });
});
