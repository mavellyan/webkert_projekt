import { expect, test } from '@playwright/test'

test('happy path login and navigation', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'Bejelentkezés' })).toBeVisible()

  await page.getByLabel('Email').fill('allas@pelda.hu')
  await page.getByLabel('Jelszó').fill('test123')
  await page.getByRole('button', { name: 'Belépés' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByText('Belépve:')).toBeVisible()

  await page.getByRole('link', { name: 'Állások', exact: true }).click()
  await expect(page).toHaveURL(/\/jobs$/)
  await expect(page.getByText('Találatok:')).toBeVisible()
})
