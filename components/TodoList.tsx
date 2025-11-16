'use client'

import { useState, useEffect, FormEvent } from 'react'

interface Todo {
  text: string
  done: boolean
  createdAt: number
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')

  const TODOS_KEY = 'edu_todos_v1'

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(TODOS_KEY) || '[]')
      setTodos(stored)
    } catch (e) {
      setTodos([])
    }
  }

  const saveTodos = (newTodos: Todo[]) => {
    localStorage.setItem(TODOS_KEY, JSON.stringify(newTodos))
    setTodos(newTodos)
  }

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const newTodos = [{ text, done: false, createdAt: Date.now() }, ...todos]
    saveTodos(newTodos)
    setInput('')
  }

  const handleToggle = (idx: number) => {
    const newTodos = [...todos]
    newTodos[idx].done = !newTodos[idx].done
    saveTodos(newTodos)
  }

  const handleDelete = (idx: number) => {
    const newTodos = [...todos]
    newTodos.splice(idx, 1)
    saveTodos(newTodos)
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
        {todos.length === 0 ? (
          <div className="text-[var(--muted)]">No tasks yet. Add one!</div>
        ) : (
          todos.map((todo, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] border border-[rgba(255,255,255,0.04)] ${
                todo.done ? 'opacity-60 line-through' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(idx)}
              />
              <div className="flex-1">{todo.text}</div>
              <button 
                className="bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)] px-2 py-1.5 rounded-lg cursor-pointer"
                onClick={() => handleDelete(idx)}
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
