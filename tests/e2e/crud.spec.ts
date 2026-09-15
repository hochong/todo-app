import { test, expect } from '@playwright/test';

/**
 * CRUD flows through the UI: TodoApi/Controllers/TodosController.cs backs
 * these via GET/POST/PUT/DELETE /api/todos, exercised here through
 * todo-client/src/components/AddForm.jsx, TodoItem.jsx and Modal.jsx.
 */
test.describe('Todo CRUD via UI', () => {
  test('creates a new todo with only a title', async ({ page }) => {
    await page.goto('/');
    const title = `Buy milk ${Date.now()}`;

    await page.getByPlaceholder('What needs to be done?').fill(title);
    await page.getByRole('button', { name: 'Add Task' }).click();

    await expect(page.locator('.todo-title', { hasText: title })).toBeVisible();
  });

  test('creates a new todo with title, date and description', async ({ page }) => {
    await page.goto('/');
    const title = `Plan trip ${Date.now()}`;

    await page.getByPlaceholder('What needs to be done?').fill(title);
    await page.locator('.add-form input[type="date"]').fill('2026-09-01');
    await page.getByPlaceholder('Add details...').fill('Book flights and hotel');
    await page.getByRole('button', { name: 'Add Task' }).click();

    const item = page.locator('.todo-item', { hasText: title });
    await expect(item).toBeVisible();
    await expect(item.locator('.todo-date-badge')).toContainText('Sep');
  });

  test('expands a todo and updates its title', async ({ page }) => {
    await page.goto('/');
    const title = `Old title ${Date.now()}`;

    await page.getByPlaceholder('What needs to be done?').fill(title);
    await page.getByRole('button', { name: 'Add Task' }).click();

    const item = page.locator('.todo-item', { hasText: title });
    await item.locator('.todo-header').click();

    const newTitle = `${title} - edited`;
    await item.locator('.todo-body input[type="text"]').fill(newTitle);
    await item.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('.todo-title', { hasText: newTitle })).toBeVisible();
  });

  test('toggles a todo done state via the check circle', async ({ page }) => {
    await page.goto('/');
    const title = `Toggle me ${Date.now()}`;

    await page.getByPlaceholder('What needs to be done?').fill(title);
    await page.getByRole('button', { name: 'Add Task' }).click();

    const item = page.locator('.todo-item', { hasText: title });
    await item.locator('.todo-check').click();

    await expect(item.locator('.todo-check')).toHaveClass(/done/);
    await expect(item.locator('.todo-title')).toHaveClass(/done/);
  });

  test('deletes a todo from the expanded view', async ({ page }) => {
    await page.goto('/');
    const title = `Delete me ${Date.now()}`;

    await page.getByPlaceholder('What needs to be done?').fill(title);
    await page.getByRole('button', { name: 'Add Task' }).click();

    const item = page.locator('.todo-item', { hasText: title });
    await item.locator('.todo-header').click();
    await item.getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('.todo-item', { hasText: title })).toHaveCount(0);
  });

  test('creates a todo via the calendar day modal', async ({ page }) => {
    await page.goto('/');

    await page.locator('.cal-cell:not(.other-month)').first().click();
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();

    const title = `Modal task ${Date.now()}`;
    await modal.getByPlaceholder('Task title').fill(title);
    await modal.getByRole('button', { name: 'Add Task' }).click();

    await expect(page.locator('.modal-overlay')).toHaveCount(0);
    await expect(page.locator('.todo-title', { hasText: title })).toBeVisible();
  });
});
