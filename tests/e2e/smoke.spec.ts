import { expect, test } from '@playwright/test';

test('home page links to dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByText("ForgeStart, Next.js uygulamanın ihtiyaç duyduğu üretim parçalarıyla gelir.")
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Panoyu aç/ })).toHaveAttribute(
    'href',
    '/dashboard'
  );
});
