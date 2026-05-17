import { expect, test } from '@playwright/test';

test('home page links to dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByText('ForgeStart ships the production pieces your Next.js app needs.')
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Open dashboard/ })).toHaveAttribute(
    'href',
    '/dashboard'
  );
});
