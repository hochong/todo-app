import { test, expect } from '@playwright/test';

const API = 'http://localhost:5000/api/todos';

/**
 * Header/task-count, the empty state in TodoList.jsx, and the Calendar.jsx
 * month navigation + date-click-opens-modal behavior.
 */
test.describe('Navigation, calendar and empty states', () => {
  test('shows the empty state message when there are no todos', async ({ page, request }) => {
    // Clear out any existing todos via the API so the empty state is
    // guaranteed to render, then load the app.
    const existing = await (await request.get(API)).json();
    for (const todo of existing) {
      await request.delete(`${API}/${todo.id}`);
    }

    await page.goto('/');

    await expect(page.getByText('No tasks yet.')).toBeVisible();
    await expect(page.locator('.task-count')).toHaveText('0 tasks');
  });

  test('task count in the header reflects the number of todos', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('What needs to be done?').fill(`Count check ${Date.now()}`);
    await page.getByRole('button', { name: 'Add Task' }).click();

    const count = await page.locator('.todo-item').count();
    await expect(page.locator('.task-count')).toHaveText(`${count} task${count !== 1 ? 's' : ''}`);
  });

  test('calendar navigates to the next month and back', async ({ page }) => {
    await page.goto('/');
    const label = page.locator('.month-year');
    const initial = await label.textContent();

    await page.locator('.cal-nav').nth(1).click(); // '›' next month
    await expect(label).not.toHaveText(initial ?? '');

    await page.locator('.cal-nav').nth(0).click(); // '‹' previous month
    await expect(label).toHaveText(initial ?? '');
  });

  test('clicking a calendar date opens the add-task modal with that date', async ({ page }) => {
    await page.goto('/');

    await page.locator('.cal-cell.today').first().click();

    await expect(page.locator('.modal h3')).toContainText('Add Task —');
  });
});
