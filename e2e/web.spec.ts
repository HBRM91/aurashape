import { test, expect } from '@playwright/test';

test.describe('Public routes', () => {
  test('landing page loads and shows CTAs', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
    await expect(page.getByText('Start free').first()).toBeVisible();
  });

  test('login route renders', async ({ page }) => {
    const response = await page.goto('/auth/login');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input')).toHaveCount(2);
  });

  test('signup route renders', async ({ page }) => {
    const response = await page.goto('/auth/signup');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input')).toHaveCount(3);
  });

  test('forgot password route renders', async ({ page }) => {
    const response = await page.goto('/auth/forgot-password');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input')).toHaveCount(1);
  });
});

test.describe('Responsive layout', () => {
  test('desktop 1440px does not overflow horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
  });

  test('mobile 390px does not overflow horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test.describe('Route accessibility', () => {
  const routes = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
  ];

  for (const route of routes) {
    test(`${route} returns HTTP 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    });
  }
});

test.describe('Deployment smoke checks', () => {
  async function completeLocalOnboarding(page: import('@playwright/test').Page, sex: 'Male' | 'Female') {
    await page.goto('/auth/signup');
    await page.getByRole('button', { name: 'Continue locally' }).click();
    await page.getByRole('checkbox').nth(0).click();
    await page.getByRole('checkbox').nth(1).click();
    await page.getByText('Continue', { exact: true }).click();
    await expect(page).toHaveURL(/\/onboarding\/?$/);
    await page.getByText('Improve Health', { exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText(sex, { exact: true }).click();
    const bodyInputs = page.locator('input');
    await bodyInputs.nth(0).fill('1990-01-01');
    await bodyInputs.nth(1).fill('175');
    await bodyInputs.nth(2).fill('75');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Moderately Active', { exact: true }).click();
    await page.getByText('Omnivore', { exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page).toHaveURL(/\/diary\/?$/);
  }

  test('legal routes and page assets return successfully', async ({ page, request }) => {
    await page.goto('/');
    for (const route of ['/privacy', '/terms']) {
      const response = await request.get(new URL(route, page.url()).toString());
      expect(response.status()).toBe(200);
    }

    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const assetUrls = await page.locator('script[src], link[href], img[src]').evaluateAll((elements) => (
      elements.map((element) => (
        element.getAttribute('src') || element.getAttribute('href')
      )).filter((url): url is string => Boolean(url && !url.startsWith('data:')))
    ));
    for (const assetUrl of assetUrls) {
      const response = await request.get(new URL(assetUrl, page.url()).toString());
      expect(response.status(), assetUrl).toBe(200);
    }
    expect(errors).toEqual([]);
  });

  test('local-only signup can continue into privacy consent', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('button', { name: 'Continue locally' }).click();
    await expect(page).toHaveURL(/\/onboarding\/privacy-consent$/);
    await expect(page.getByText('Your Privacy Matters')).toBeVisible();
  });

  test('local-only consent can continue into onboarding and survives reload', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('button', { name: 'Continue locally' }).click();
    await page.getByRole('checkbox').nth(0).click();
    await page.getByRole('checkbox').nth(1).click();
    await page.getByText('Continue', { exact: true }).click();
    await expect(page).toHaveURL(/\/onboarding\/?$/);
    await page.reload();
    await expect(page).toHaveURL(/\/onboarding\/?$/);
    await expect(page.getByText("What's your goal?")).toBeVisible();
  });

  test('organization route is protected and explains local privacy mode', async ({ page }) => {
    await completeLocalOnboarding(page, 'Female');
    await page.goto('/organization');
    await expect(page).toHaveURL(/\/organization\/?$/);
    await expect(page.getByText('Organizations', { exact: true })).toBeVisible();
    await expect(page.getByText('Cloud mode is off', { exact: true })).toBeVisible();
  });

  test('male profiles cannot access Cycle directly', async ({ page }) => {
    await completeLocalOnboarding(page, 'Male');
    await page.goto('/cycle');
    await expect(page).toHaveURL(/\/progress\/?$/);
    await expect(page.getByText('Progress', { exact: true }).last()).toBeVisible();
  });

  test('dark mode selection persists across routes and reloads', async ({ page }) => {
    await completeLocalOnboarding(page, 'Female');
    await page.goto('/profile');
    await page.getByText('Dark', { exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('theme-storage'))).toContain('dark');
    await page.goto('/diary');
    await page.reload();
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('theme-storage'))).toContain('dark');
  });
});
