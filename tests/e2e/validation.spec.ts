import { test, expect } from '@playwright/test';

/**
 * Client-side validation / edge cases in AddForm.jsx, TodoItem.jsx and
 * Modal.jsx, all of which guard on `if (!title.trim()) return` before
 * calling the API.
 */
test.describe('Form validation and edge cases', () => {
  test('does not add a todo when the title is empty', async ({ page }) => {
    await page.goto('/');
    const countBefore = await page.locator('.todo-item').count();

    await page.getByRole('button', { name: 'Add Task' }).click();

    await expect(page.locator('.todo-item')).toHaveCount(countBefore);
  });

  test('does not add a todo when the title is only whitespace', async ({ page }) => {
    await page.goto('/');
    const countBefore = await page.locator('.todo-item').count();

    await page.getByPlaceholder('What needs to be done?').fill('   ');
    await page.getByRole('button', { name: 'Add Task' }).click();

    await expect(page.locator('.todo-item')).toHaveCount(countBefore);
  });

  test('pressing Enter in the title field submits the add form', async ({ page }) => {
    await page.goto('/');
    const title = `Enter submit ${Date.now()}`;

    const titleInput = page.getByPlaceholder('What needs to be done?');
    await titleInput.fill(title);
    await titleInput.press('Enter');

    await expect(page.locator('.todo-title', { hasText: title })).toBeVisible();
  });

  test('clearing a todo title and saving does not persist an empty title', async ({ page }) => {
    await page.goto('/');
    const title = `Keep me ${Date.now()}`;

    await page.getByPlaceholder('What needs to be done?').fill(title);
    await page.getByRole('button', { name: 'Add Task' }).click();

    const item = page.locator('.todo-item', { hasText: title });
    await item.locator('.todo-header').click();
    await item.locator('.todo-body input[type="text"]').fill('   ');
    await item.getByRole('button', { name: 'Save' }).click();

    // handleSave() returns early on a blank title, so the original title
    // is still shown and no PUT request is ever made.
    await expect(page.locator('.todo-title', { hasText: title })).toBeVisible();
  });

  test('modal Cancel button closes without adding a todo', async ({ page }) => {
    await page.goto('/');
    const countBefore = await page.locator('.todo-item').count();

    await page.locator('.cal-cell:not(.other-month)').first().click();
    const modal = page.locator('.modal');
    await modal.getByPlaceholder('Task title').fill('Should not be added');
    await modal.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.locator('.modal-overlay')).toHaveCount(0);
    await expect(page.locator('.todo-item')).toHaveCount(countBefore);
  });
});
