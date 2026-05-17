import { expect, test } from '@playwright/test';

test('home page links to dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByText('Next.js starter with the boring production pieces already wired.')
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Open dashboard/ })).toHaveAttribute(
    'href',
    '/dashboard'
  );
});
