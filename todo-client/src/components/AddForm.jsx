import { useState } from 'react'

export default function AddForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [desc, setDesc] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    if (!title.trim()) return
    setAdding(true)
    const ok = await onAdd({ title: title.trim(), date: date || null, description: desc })
    if (ok) {
      setTitle('')
      setDate('')
      setDesc('')
    }
    setAdding(false)
  }

  return (
    <div className="add-form">
      <div className="form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Title</label>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Date (optional)</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Description (optional)</label>
        <textarea
          placeholder="Add details..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
        />
      </div>
      <button className="btn-add" onClick={handleAdd} disabled={adding}>
        {adding ? 'Adding...' : 'Add Task'}
      </button>
    </div>
  )
}
