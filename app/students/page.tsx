'use client'

import { useState } from 'react'
import DocumentLocker from '@/components/DocumentLocker'
import TodoList from '@/components/TodoList'
import VideoLectures from '@/components/VideoLectures'
import Navbar from '@/components/Navbar'

export default function StudentsPage() {
  const [stats] = useState({ documents: 12, tasks: 8, videos: 15 })

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-[1400px] mx-auto p-8">
        <h1 className="text-[2.5rem] font-bold mb-8 text-[var(--text)]">📚 Student Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Documents</h3>
            <p className="text-4xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{stats.documents}</p>
            <p className="text-sm text-[var(--muted)]">Saved in locker</p>
          </div>
          <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Tasks</h3>
            <p className="text-4xl font-bold mb-1" style={{ color: '#10b981' }}>{stats.tasks}</p>
            <p className="text-sm text-[var(--muted)]">In your todo list</p>
          </div>
          <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Video Lectures</h3>
            <p className="text-4xl font-bold mb-1" style={{ color: '#f59e0b' }}>{stats.videos}</p>
            <p className="text-sm text-[var(--muted)]">Available to watch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          <aside>
            <DocumentLocker />
          </aside>

          <section>
            <TodoList />
            <div style={{ marginTop: '16px' }}>
              <VideoLectures />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
