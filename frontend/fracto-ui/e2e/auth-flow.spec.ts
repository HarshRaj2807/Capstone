import { test, expect } from '@playwright/test';

test('user can log in and reach doctors page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@fracto.com');
  await page.getByLabel('Password').fill('User@123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/doctors/);
  await expect(page.getByText('Doctor Discovery')).toBeVisible();
});

test('admin can log in and reach admin console', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fracto.com');
  await page.getByLabel('Password').fill('Admin@123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/admin/);
  await expect(page.getByText('Admin Console')).toBeVisible();
});
