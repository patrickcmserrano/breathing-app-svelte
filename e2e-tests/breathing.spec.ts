import { test, expect } from '@playwright/test';

test.describe('Breathing App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the app's homepage before each test
    await page.goto('/');
  });

  test('should load homepage', async ({ page }) => {
    // Verify page title and main elements
    await expect(page).toHaveTitle(/WebOasis|Breathing/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for breathing app elements
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
  });

  test('should navigate to About page', async ({ page }) => {
    // Find and click About link
    const aboutLink = page.getByRole('link').filter({ hasText: /about/i });
    
    // Check if About link exists before clicking
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      
      // Verify we're on the About page - looking for level 1 heading specifically
      const aboutHeading = page.getByRole('heading', { level: 1 });
      await expect(aboutHeading).toBeVisible();
      
      // Verify the URL contains "about"
      await expect(page).toHaveURL(/.*about.*/i);
    } else {
      test.skip('About link not found, skipping test');
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if main elements are still visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
    
    // Set viewport back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});