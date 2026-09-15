import { test, expect } from '@playwright/test';

/**
 * Direct API tests against TodoApi/Controllers/TodosController.cs, bypassing
 * the React client entirely via Playwright's `request` fixture.
 */
const API = 'http://localhost:5000/api/todos';

test.describe('TodosController API', () => {
  test('GET /api/todos returns 200 and a JSON array', async ({ request }) => {
    const res = await request.get(API);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /api/todos creates a todo and returns it with a generated id', async ({ request }) => {
    const res = await request.post(API, {
      data: { title: `API created ${Date.now()}`, description: 'from api test', date: null },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.title).toContain('API created');

    await request.delete(`${API}/${body.id}`);
  });

  test('POST /api/todos with a missing title returns 400', async ({ request }) => {
    // TodoItem.Title is [Required], so ModelState.IsValid should be false.
    const res = await request.post(API, { data: { description: 'no title here' } });

    expect(res.status()).toBe(400);
  });

  test('PUT /api/todos/{id} updates an existing todo', async ({ request }) => {
    const created = await (
      await request.post(API, { data: { title: 'To be updated' } })
    ).json();

    const res = await request.put(`${API}/${created.id}`, {
      data: { title: 'Updated title', description: 'updated', date: null, done: true },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Updated title');
    expect(body.done).toBe(true);

    await request.delete(`${API}/${created.id}`);
  });

  test('DELETE /api/todos/{id} removes the todo; deleting again returns 404', async ({ request }) => {
    const created = await (
      await request.post(API, { data: { title: 'To be deleted' } })
    ).json();

    const first = await request.delete(`${API}/${created.id}`);
    expect(first.status()).toBe(204);

    const second = await request.delete(`${API}/${created.id}`);
    expect(second.status()).toBe(404);
  });
});
