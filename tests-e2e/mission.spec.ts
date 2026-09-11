import { test, expect, type Page } from '@playwright/test';

test.setTimeout(60000);

type CanvasBox = { x: number; y: number; width: number; height: number };
const canvasBoxes = new WeakMap<Page, CanvasBox>();

async function canvasBox(page: Page) {
  const cached = canvasBoxes.get(page); if (cached) return cached;
  const box = await page.locator('#game-container canvas').boundingBox();
  if (!box) throw new Error('Phaser canvas not available');
  canvasBoxes.set(page, box); return box;
}

async function worldPoint(page: Page, x: number, y: number) {
  const box = await canvasBox(page);
  return { x: box.x + (x / 1280) * box.width, y: box.y + (y / 720) * box.height };
}

async function clickWorld(page: Page, x: number, y: number) { const point = await worldPoint(page, x, y); await page.mouse.click(point.x, point.y); }

async function dragWorld(page: Page, fromX: number, fromY: number, toX: number, toY: number) {
  const from = await worldPoint(page, fromX, fromY); const to = await worldPoint(page, toX, toY);
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y, { steps: 8 }); await page.mouse.up();
}

async function clickUntilToast(page: Page, x: number, y: number, message: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) { await clickWorld(page, x, y); try { await expect(page.getByTestId('world-toast')).toContainText(message, { timeout: 1200 }); return; } catch { /* Phaser may still be creating the scene input. */ } }
  throw new Error(`Toast not found after clicking world point ${x},${y}: ${message}`);
}

async function clickUntilScene(page: Page, x: number, y: number, scene: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) { await clickWorld(page, x, y); try { await expect(page.getByTestId('game-hud')).toContainText(scene, { timeout: 1200 }); return; } catch { /* Retry only while the scene is settling. */ } }
  throw new Error(`Scene not reached after clicking world point ${x},${y}: ${scene}`);
}

async function clickUntilNotice(page: Page, x: number, y: number, message: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) { await clickWorld(page, x, y); try { await expect(page.getByTestId('activity-notice')).toContainText(message, { timeout: 1200 }); return; } catch { /* Phaser may still be enabling scene input. */ } }
  throw new Error(`Activity notice not found at ${x},${y}: ${message}`);
}

async function dragUntilToast(page: Page, fromX: number, fromY: number, toX: number, toY: number, message: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) { await dragWorld(page, fromX, fromY, toX, toY); try { await expect(page.getByTestId('world-toast')).toContainText(message, { timeout: 1200 }); return; } catch { /* Retry while the draggable settles back into its slot. */ } }
  throw new Error(`Drop not registered at ${toX},${toY}: ${message}`);
}

async function startFresh(page: Page) {
  await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.goto('/?fresh=phaser');
  await page.getByTestId('start-game').click(); await expect(page.getByTestId('phaser-game')).toBeVisible();
  await page.locator('#game-container canvas').waitFor({ state: 'visible' }); await canvasBox(page); await expect(page.getByTestId('game-hud')).toContainText('OFFICE');
}

test('completes the vertical slice: office, key, archive and HABLAR evidence', async ({ page }) => {
  const pageErrors: string[] = []; page.on('pageerror', error => pageErrors.push(error.message)); await startFresh(page);
  await clickUntilNotice(page, 885, 390, 'ESTA PISTA TODAVÍA ESTÁ BLOQUEADA');
  await clickUntilToast(page, 330, 390, 'café'); await clickUntilToast(page, 390, 455, 'Llave encontrada'); await clickUntilScene(page, 885, 390, 'ARCHIVE');
  await dragWorld(page, 525, 420, 1020, 430); await expect(page.getByTestId('game-hud')).toContainText('1/10'); await expect(page.getByTestId('game-hud')).toContainText('HABLAR'); expect(pageErrors).toEqual([]);
});

test('uses the real magnifier and cooperative dialogue puzzle', async ({ page }) => {
  const pageErrors: string[] = []; page.on('pageerror', error => pageErrors.push(error.message)); await startFresh(page);
  await clickUntilToast(page, 330, 390, 'café'); await clickUntilToast(page, 390, 455, 'Llave encontrada'); await clickUntilScene(page, 885, 390, 'ARCHIVE'); await dragWorld(page, 525, 420, 1020, 430); await expect(page.getByTestId('game-hud')).toContainText('1/10'); await page.waitForTimeout(700);
  await clickUntilScene(page, 1080, 390, 'MAGNIFIER');
  await clickWorld(page, 350, 300); await clickWorld(page, 825, 365); await clickWorld(page, 1030, 560); await page.waitForTimeout(1100);
  await clickUntilScene(page, 505, 390, 'CHATPUZZLE');
  await dragWorld(page, 230, 410, 680, 265); await dragWorld(page, 755, 410, 1020, 265); await page.waitForTimeout(1100); expect(pageErrors).toEqual([]);
});

test('completes the adventure with board links, sorting arcade and safe finale', async ({ page }) => {
  const pageErrors: string[] = []; page.on('pageerror', error => pageErrors.push(error.message)); await startFresh(page);
  await clickUntilToast(page, 330, 390, 'café'); await clickUntilToast(page, 390, 455, 'Llave encontrada'); await clickUntilScene(page, 885, 390, 'ARCHIVE');
  await dragWorld(page, 525, 420, 1020, 430); await expect(page.getByTestId('game-hud')).toContainText('1/10'); await page.waitForTimeout(700);
  await clickWorld(page, 505, 390); await expect(page.getByTestId('game-hud')).toContainText('CHATPUZZLE'); await dragWorld(page, 230, 410, 680, 265); await dragWorld(page, 755, 410, 1020, 265); await expect(page.getByTestId('game-hud')).toContainText('OFFICE'); await page.waitForTimeout(900);
  await clickWorld(page, 700, 390); await expect(page.getByTestId('game-hud')).toContainText('EVIDENCEBOARD'); await clickWorld(page, 270, 300); await clickWorld(page, 400, 510); await clickWorld(page, 530, 300); await clickWorld(page, 680, 510); await expect(page.getByTestId('game-hud')).toContainText('MYTHSTAMP'); await page.waitForTimeout(900);
  await dragWorld(page, 210, 560, 520, 280); await dragWorld(page, 210, 560, 700, 470); await expect(page.getByTestId('game-hud')).toContainText('HIDDENOBJECT'); await page.waitForTimeout(900);
  for (const [x, y] of [[250, 320], [520, 310], [810, 315], [1050, 315]]) { await clickWorld(page, x, y); } await expect(page.getByTestId('game-hud')).toContainText('TOOLKIT'); await page.waitForTimeout(900);
  await clickWorld(page, 640, 390); await clickWorld(page, 310, 330); await clickWorld(page, 520, 330); await clickWorld(page, 940, 330); await expect(page.getByTestId('game-hud')).toContainText('MAZE'); await page.waitForTimeout(900);
  await clickWorld(page, 1070, 430); await expect(page.getByTestId('game-hud')).toContainText('SORTING'); await page.waitForTimeout(900);
  const sorting = [[350, 245, 1020, 500], [635, 245, 350, 500], [920, 245, 1020, 500], [350, 340, 350, 500], [635, 340, 1020, 500], [920, 340, 350, 500]];
  for (const [index, [fx, fy, tx, ty]] of sorting.entries()) await dragUntilToast(page, fx, fy, tx, ty, `${index + 1}/6`);
  await page.waitForTimeout(1200); await expect(page.getByTestId('game-hud')).toContainText('SAFEFINALE');
  for (const x of [180, 405, 630, 855, 1080]) await clickWorld(page, x, 625); await expect(page.getByTestId('conversation-prompt')).toBeVisible({ timeout: 10000 }); await expect(page.getByTestId('conversation-prompt')).toContainText('¿Qué podemos hacer nosotros para que este salón sea un lugar donde sea más fácil pedir ayuda?'); await expect(page.getByTestId('conversation-prompt')).toContainText('Que nadie de nuestro equipo tenga que sentirse solo.'); expect(pageErrors).toEqual([]);
});
