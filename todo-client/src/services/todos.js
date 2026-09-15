import * as api from './api'
import * as localStore from './localStore'
import { getMode } from './auth'

function backend() {
  return getMode() === 'guest' ? localStore : api
}

export const fetchTodos = (...args) => backend().fetchTodos(...args)
export const createTodo = (...args) => backend().createTodo(...args)
export const updateTodo = (...args) => backend().updateTodo(...args)
export const deleteTodo = (...args) => backend().deleteTodo(...args)
