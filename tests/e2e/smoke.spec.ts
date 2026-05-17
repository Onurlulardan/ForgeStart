import { expect, test } from '@playwright/test';

test('home page links to dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Welcome to NextJS Starter')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute(
    'href',
    '/dashboard'
  );
});
