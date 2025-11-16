'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Exam {
  id: number
  subject: string
  date: string
  time: string
  duration: string
  totalMarks: number
  score?: number
  status: 'upcoming' | 'completed'
}

export default function ExamsPage() {
  const router = useRouter()
  const [exams] = useState<Exam[]>([
    {
      id: 1,
      subject: 'Mathematics',
      date: '2024-02-15',
      time: '10:00 AM',
      duration: '2 hours',
      totalMarks: 100,
      status: 'upcoming'
    },
    {
      id: 2,
      subject: 'Physics',
      date: '2024-02-18',
      time: '2:00 PM',
      duration: '2 hours',
      totalMarks: 100,
      status: 'upcoming'
    },
    {
      id: 3,
      subject: 'Chemistry',
      date: '2024-01-10',
      time: '10:00 AM',
      duration: '2 hours',
      totalMarks: 100,
      score: 92,
      status: 'completed'
    },
    {
      id: 4,
      subject: 'English',
      date: '2024-01-05',
      time: '2:00 PM',
      duration: '2 hours',
      totalMarks: 100,
      score: 88,
      status: 'completed'
    }
  ])

  const upcomingExams = exams.filter(e => e.status === 'upcoming')
  const completedExams = exams.filter(e => e.status === 'completed')

  return (
    <div className="min-h-screen p-8 max-w-[1400px] mx-auto">
      <header className="flex items-center gap-6 mb-8">
        <button 
          onClick={() => router.back()} 
          className="px-6 py-3 rounded-[12px] bg-[var(--card-bg)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-[var(--text)]">📋 Exam Schedule</h1>
      </header>

      <div className="flex flex-col gap-8">
        {/* Upcoming Exams */}
        <section className="w-full">
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Upcoming Exams</h2>
          {upcomingExams.length === 0 ? (
            <div className="glass-card">
              <p className="text-center text-[var(--muted)] p-8">No upcoming exams</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="glass-card">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                    <h3 className="text-xl font-semibold text-[var(--text)]">{exam.subject}</h3>
                    <span className="px-3.5 py-1.5 rounded-[20px] text-xs font-semibold text-white" style={{ background: 'var(--primary)' }}>Upcoming</span>
                  </div>
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)] text-sm">Date:</span>
                      <span className="text-[var(--text)] font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)] text-sm">Time:</span>
                      <span className="text-[var(--text)] font-medium">{exam.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)] text-sm">Duration:</span>
                      <span className="text-[var(--text)] font-medium">{exam.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)] text-sm">Total Marks:</span>
                      <span className="text-[var(--text)] font-medium">{exam.totalMarks}</span>
                    </div>
                  </div>
                  <button className="btn-primary">View Study Materials</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Exams */}
        <section className="w-full">
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Completed Exams</h2>
          {completedExams.length === 0 ? (
            <div className="glass-card">
              <p className="text-center text-[var(--muted)] p-8">No completed exams yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
              {completedExams.map(exam => (
                <div key={exam.id} className="glass-card">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                    <h3 className="text-xl font-semibold text-[var(--text)]">{exam.subject}</h3>
                    <span className="px-3.5 py-1.5 rounded-[20px] text-xs font-semibold text-white" style={{ background: '#10b981' }}>Completed</span>
                  </div>
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)] text-sm">Date:</span>
                      <span className="text-[var(--text)] font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)] text-sm">Score:</span>
                      <span className="text-[var(--text)] font-medium" style={{ 
                        color: exam.score && exam.score >= 80 ? '#10b981' : exam.score && exam.score >= 60 ? '#f59e0b' : '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '1.25rem'
                      }}>
                        {exam.score}/{exam.totalMarks}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)] text-sm">Percentage:</span>
                      <span className="text-[var(--text)] font-medium">{exam.score && ((exam.score / exam.totalMarks) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
