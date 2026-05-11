import TodoItem from './TodoItem'

function sortTodos(todos) {
  return [...todos].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return -1
    if (!b.date) return 1
    return a.date.localeCompare(b.date)
  })
}

export default function TodoList({ todos, loading, onUpdate, onDelete }) {
  if (loading) {
    return (
      <div className="empty-state">
        <div className="icon">⏳</div>
        Connecting to server...
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🗒️</div>
        No tasks yet.<br />Add one below or click a calendar date.
      </div>
    )
  }

  return (
    <div className="todo-list">
      {sortTodos(todos).map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
