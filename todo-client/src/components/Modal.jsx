import { useState, useEffect, useRef } from 'react'

export default function Modal({ show, date, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc]   = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (show) {
      setTitle('')
      setDesc('')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [show])

  if (!show) return null

  const label = date
    ? (() => {
        const [y, m, d] = date.split('-').map(Number)
        return new Date(y, m - 1, d).toLocaleDateString(undefined, {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        })
      })()
    : ''

  async function handleAdd() {
    if (!title.trim()) return
    setAdding(true)
    await onAdd({ title: title.trim(), date, description: desc })
    setAdding(false)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && e.target === inputRef.current) handleAdd()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onKeyDown={handleKeyDown}>
        <h3>Add Task — {label}</h3>
        <div className="form-group">
          <label>Title</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            placeholder="Details..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-add-modal" onClick={handleAdd} disabled={adding}>
            {adding ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
