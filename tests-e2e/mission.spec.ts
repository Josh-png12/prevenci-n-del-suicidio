import { test, expect } from '@playwright/test';

test('completes the ten-case mission', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/?fresh=1');
  await page.getByTestId('start-mission').click();
  const answers = [1, 2, 1, 1, 1, 2, 0, 1, 0];
  for (const answer of answers) { await page.getByTestId('enter-case').click(); await page.getByTestId(`choice-${answer}`).click(); await page.getByTestId('feedback-continue').click(); await page.getByTestId('evidence-unlock').getByRole('button').click(); }
  await page.getByTestId('enter-case').click();
  for (const i of [0, 1, 2, 3, 4]) await page.getByTestId('support-network').getByRole('button').nth(i).click();
  await page.getByTestId('feedback-continue').click();
  await page.getByTestId('evidence-unlock').getByRole('button').click();
  await page.getByTestId('open-safe').click();
  await expect(page.getByTestId('final-screen')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CÓDIGO DE APOYO DESCIFRADO' })).toBeVisible();
});

test('allows retry, keyboard shortcuts, reset confirmation and fullscreen fallback', async ({ page }) => {
  await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.goto('/?fresh=2');
  await page.getByTestId('start-mission').click(); await expect(page.getByTestId('enter-case')).toBeVisible(); await page.keyboard.press('Enter'); await expect(page.getByTestId('case-card')).toBeVisible(); await page.getByTestId('choice-0').click();
  await expect(page.getByText('PISTA FALSA')).toBeVisible(); await page.keyboard.press('Enter'); await expect(page.getByTestId('case-card')).toBeVisible();
  await page.getByTestId('choice-1').click(); await page.getByTestId('feedback-continue').click(); await page.getByTestId('evidence-unlock').getByRole('button').click();
  await page.getByRole('button', { name: /REINICIAR MISIÓN/ }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button', { name: 'Seguir misión' }).click();
  await page.getByRole('button', { name: /PANTALLA COMPLETA/ }).click();
});
