'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSession } from '@/lib/auth-client'

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export default function TodoList() {
  const { data: session } = useSession()
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      loadTodos()
    }
  }, [session])

  const loadTodos = async () => {
    try {
      const response = await fetch('/api/student/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data.todos)
      }
    } catch (e) {
      console.error('Error loading todos:', e)
    } finally {
      setLoading(false)
    }
  }

  const saveTodo = async (title: string) => {
    try {
      const response = await fetch('/api/student/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (response.ok) {
        await loadTodos()
      }
    } catch (e) {
      console.error('Error saving todo:', e)
    }
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    await saveTodo(text)
    setInput('')
  }

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/student/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      if (response.ok) {
        await loadTodos()
      }
    } catch (e) {
      console.error('Error toggling todo:', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/student/todos/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadTodos()
      }
    } catch (e) {
      console.error('Error deleting todo:', e)
    }
  }

  return (
    <div className="bg-[rgba(15,23,36,0.22)] backdrop-blur-[8px] p-[18px] rounded-[12px] shadow-[0_10px_30px_rgba(2,6,23,0.6)] border border-[rgba(255,255,255,0.04)]">
      <h3 className="mt-0">To‑Do List</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mt-2 items-center">
        <input
          type="text"
          placeholder="New task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-2.5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent text-[var(--text)]"
        />
        <button 
          type="submit" 
          className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold"
        >
          Add
        </button>
      </form>

      <div className="mt-2 flex flex-col gap-2">
        {loading ? (
          <div className="text-[var(--muted)]">Loading...</div>
        ) : todos.length === 0 ? (
          <div className="text-[var(--muted)]">No tasks yet. Add one!</div>
        ) : (
          todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] border border-[rgba(255,255,255,0.04)] ${
                todo.completed ? 'opacity-60 line-through' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id, todo.completed)}
              />
              <div className="flex-1">{todo.title}</div>
              <button 
                className="bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)] px-2 py-1.5 rounded-lg cursor-pointer"
                onClick={() => handleDelete(todo.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
