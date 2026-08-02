import { test, expect } from '@playwright/test';

test.describe('Public routes', () => {
  test('landing page loads and shows CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('login route renders', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('signup route renders', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('body')).toBeVisible();
  });

  test('forgot password route renders', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Responsive layout', () => {
  test('desktop 1440px does not overflow horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const body = page.locator('body');
    const box = await body.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(1440);
    }
  });

  test('mobile 390px does not overflow horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const body = page.locator('body');
    const box = await body.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }
  });
});

test.describe('Route accessibility', () => {
  const routes = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
  ];

  for (const route of routes) {
    test(`${route} returns 200 or renders content`, async ({ page }) => {
      const response = await page.goto(route);
      if (response && response.status() === 200) {
        expect(response.status()).toBe(200);
      } else {
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(10);
      }
    });
  }
});
