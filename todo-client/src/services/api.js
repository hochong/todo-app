import { getToken, logout } from './auth'

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/todos`

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handle(res) {
  if (res.status === 401) {
    logout()
    window.dispatchEvent(new Event('todo:auth-expired'))
    throw new Error('Session expired')
  }
  return res
}

export async function fetchTodos() {
  const res = await handle(await fetch(BASE, { headers: authHeaders() }))
  if (!res.ok) throw new Error('Failed to fetch todos')
  return res.json()
}

export async function createTodo(todo) {
  const res = await handle(await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(todo),
  }))
  if (!res.ok) throw new Error('Failed to create todo')
  return res.json()
}

export async function updateTodo(id, todo) {
  const res = await handle(await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(todo),
  }))
  if (!res.ok) throw new Error('Failed to update todo')
  return res.json()
}

export async function deleteTodo(id) {
  const res = await handle(await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }))
  if (!res.ok) throw new Error('Failed to delete todo')
}
