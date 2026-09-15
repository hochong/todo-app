const KEY = 'todo_guest_tasks'

function readAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function writeAll(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export async function fetchTodos() {
  return readAll().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export async function createTodo(todo) {
  const item = {
    id: crypto.randomUUID(),
    title: todo.title,
    description: todo.description || null,
    date: todo.date || null,
    done: false,
    createdAt: new Date().toISOString(),
  }
  const items = readAll()
  items.push(item)
  writeAll(items)
  return item
}

export async function updateTodo(id, todo) {
  const items = readAll()
  const index = items.findIndex(t => t.id === id)
  if (index === -1) throw new Error('Task not found')
  items[index] = { ...items[index], ...todo, id }
  writeAll(items)
  return items[index]
}

export async function deleteTodo(id) {
  writeAll(readAll().filter(t => t.id !== id))
}

export function clearGuestData() {
  localStorage.removeItem(KEY)
}
