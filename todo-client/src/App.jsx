import { useState, useEffect, useCallback } from 'react'
import TodoList from './components/TodoList'
import AddForm from './components/AddForm'
import Calendar from './components/Calendar'
import Modal from './components/Modal'
import Toast from './components/Toast'
import * as api from './services/api'

export default function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '' })
  const [modal, setModal] = useState({ show: false, date: null })

  const showToast = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 2200)
  }

  const loadTodos = useCallback(async () => {
    try {
      const data = await api.fetchTodos()
      setTodos(data)
    } catch {
      showToast('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTodos() }, [loadTodos])

  const addTodo = async (todo) => {
    try {
      const created = await api.createTodo(todo)
      setTodos(prev => [...prev, created])
      showToast('Task added!')
      return true
    } catch {
      showToast('Failed to add task')
      return false
    }
  }

  const updateTodo = async (id, todo) => {
    try {
      const updated = await api.updateTodo(id, todo)
      setTodos(prev => prev.map(t => t.id === id ? updated : t))
      showToast('Task updated')
      return true
    } catch {
      showToast('Failed to update task')
      return false
    }
  }

  const deleteTodo = async (id) => {
    try {
      await api.deleteTodo(id)
      setTodos(prev => prev.filter(t => t.id !== id))
      showToast('Task deleted')
    } catch {
      showToast('Failed to delete task')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">✅ Todoist</span>
        <span className="task-count">
          {todos.length} task{todos.length !== 1 ? 's' : ''}
        </span>
      </header>

      <div className="main">
        <div className="left-panel">
          <div className="panel-half top-half">
            <div className="panel-label">📋 My Tasks</div>
            <TodoList
              todos={todos}
              loading={loading}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          </div>
          <div className="panel-half bottom-half">
            <div className="panel-label">➕ Add Task</div>
            <AddForm onAdd={addTodo} />
          </div>
        </div>

        <div className="right-panel">
          <Calendar todos={todos} onDateClick={(date) => setModal({ show: true, date })} />
        </div>
      </div>

      <Modal
        show={modal.show}
        date={modal.date}
        onClose={() => setModal({ show: false, date: null })}
        onAdd={addTodo}
      />

      <Toast show={toast.show} message={toast.message} />
    </div>
  )
}
