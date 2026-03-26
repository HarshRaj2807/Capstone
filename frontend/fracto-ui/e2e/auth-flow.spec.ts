import { test, expect } from '@playwright/test';

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

async function login(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

async function logout(page: any) {
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.goto('/login');
}

test('user can log in and reach doctors page', async ({ page }) => {
  await login(page, 'user@fracto.com', 'User@123');

  await expect(page).toHaveURL(/doctors/);
  await expect(page.getByText('Doctor Discovery')).toBeVisible();
});

test('admin can log in and reach admin console', async ({ page }) => {
  await login(page, 'admin@fracto.com', 'Admin@123');

  await expect(page).toHaveURL(/admin/);
  await expect(page.getByText('Admin Console')).toBeVisible();
});

test('user can book and admin can complete an appointment', async ({ page }) => {
  const appointmentDate = getTomorrowDate();
  const visitReason = `E2E-${Date.now()}`;

  await login(page, 'user@fracto.com', 'User@123');
  await expect(page).toHaveURL(/doctors/);

  await page.getByLabel('Appointment Date').fill(appointmentDate);
  await page.getByRole('button', { name: 'Explore Doctors' }).click();

  const firstDoctorCard = page.locator('.doctor-card').first();
  await expect(firstDoctorCard).toBeVisible();

  const doctorName = (await firstDoctorCard.locator('h3').first().textContent())?.trim() ?? 'Doctor';
  const slotButton = firstDoctorCard.locator('.slots-grid button:not([disabled])').first();
  await expect(slotButton).toBeVisible();
  const timeSlot = (await slotButton.textContent())?.trim() ?? '09:00';

  await slotButton.click();
  await expect(page).toHaveURL(/payment/);

  await page.getByLabel('Cardholder Name').fill('Test User');
  await page.getByLabel('Card Number').fill('4242424242424242');
  await page.getByLabel('Expiry').fill('12/29');
  await page.getByLabel('CVV').fill('123');
  await page.getByLabel('Reason for Visit').fill(visitReason);
  await page.getByLabel('I confirm the consultation fee and booking details shown above.').check();
  await page.getByRole('button', { name: 'Pay & Confirm Appointment' }).click();

  await expect(page.getByText('Appointment Confirmed')).toBeVisible();
  await page.getByRole('button', { name: 'View Appointments' }).click();

  await expect(page).toHaveURL(/appointments/);
  const bookedAppointment = page
    .locator('.appointment-card', { hasText: doctorName })
    .filter({ hasText: visitReason })
    .first();
  await expect(bookedAppointment).toBeVisible();

  await logout(page);

  await login(page, 'admin@fracto.com', 'Admin@123');
  await expect(page).toHaveURL(/admin/);
  await page.getByRole('button', { name: 'Appointments' }).click();

  const appointmentRow = page.locator('.list-item', { hasText: doctorName }).filter({ hasText: `${appointmentDate} at ${timeSlot}` });
  await expect(appointmentRow).toBeVisible();
  await appointmentRow.locator('select').selectOption('Completed');
  await appointmentRow.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('Appointment status updated successfully.')).toBeVisible();

  await logout(page);
});
