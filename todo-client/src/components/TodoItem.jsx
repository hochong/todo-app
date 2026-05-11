import { useState } from 'react'

function formatDisplay(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function getBadgeClass(dateStr) {
  if (!dateStr) return ''
  const today = new Date()
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const [y, m, d] = dateStr.split('-').map(Number)
  const taskDate = new Date(y, m - 1, d)
  const diff = (taskDate - todayNorm) / 86400000
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return ''
}

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [date, setDate] = useState(todo.date || '')
  const [desc, setDesc] = useState(todo.description || '')
  const [saving, setSaving] = useState(false)

  const badgeClass = getBadgeClass(todo.date)
  const displayDate = formatDisplay(todo.date)
  const badgeLabel = !todo.date
    ? 'No date'
    : badgeClass === 'overdue' ? `⚠ ${displayDate}`
    : badgeClass === 'today' ? 'Today'
    : displayDate

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onUpdate(todo.id, {
      ...todo,
      title: title.trim(),
      date: date || null,
      description: desc,
    })
    setSaving(false)
    setOpen(false)
  }

  async function handleToggleDone(e) {
    e.stopPropagation()
    await onUpdate(todo.id, { ...todo, done: !todo.done })
  }

  return (
    <div className={`todo-item${open ? ' open' : ''}`}>
      <div className="todo-header" onClick={() => setOpen(o => !o)}>
        <div
          className={`todo-check${todo.done ? ' done' : ''}`}
          onClick={handleToggleDone}
        />
        <div className={`todo-title${todo.done ? ' done' : ''}`}>{todo.title}</div>
        <span className={`todo-date-badge ${badgeClass}`}>{badgeLabel}</span>
        <span className="chevron">▼</span>
      </div>

      {open && (
        <div className="todo-body">
          <div className="field-label">Title</div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="field-label">Date</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <div className="field-label">Description</div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
          />
          <div className="todo-actions">
            <button className="btn btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn btn-delete" onClick={() => onDelete(todo.id)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
