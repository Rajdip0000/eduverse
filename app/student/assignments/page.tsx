'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Assignment {
  id: number
  subject: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted'
  submittedDate?: string
}

export default function AssignmentsPage() {
  const router = useRouter()
  const [assignments] = useState<Assignment[]>([
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Calculus Problem Set',
      description: 'Solve problems from Chapter 5: Integration and Differentiation',
      dueDate: '2024-02-20',
      status: 'pending'
    },
    {
      id: 2,
      subject: 'Physics',
      title: 'Newton\'s Laws Lab Report',
      description: 'Complete lab report on Newton\'s three laws of motion experiment',
      dueDate: '2024-02-25',
      status: 'pending'
    },
    {
      id: 3,
      subject: 'English',
      title: 'Essay on Shakespeare',
      description: 'Write a 1500-word essay analyzing themes in Hamlet',
      dueDate: '2024-01-15',
      status: 'submitted',
      submittedDate: '2024-01-14'
    },
    {
      id: 4,
      subject: 'Chemistry',
      title: 'Periodic Table Project',
      description: 'Create an interactive presentation on transition metals',
      dueDate: '2024-01-10',
      status: 'submitted',
      submittedDate: '2024-01-08'
    }
  ])

  const pendingAssignments = assignments.filter(a => a.status === 'pending')
  const submittedAssignments = assignments.filter(a => a.status === 'submitted')

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen p-8 max-w-[1400px] mx-auto">
      <header className="flex items-center gap-6 mb-8">
        <button onClick={() => router.back()} className="py-3 px-6 rounded-[12px] bg-[var(--card-bg)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]">← Back</button>
        <h1 className="text-[2rem] font-bold text-[var(--text)]">📝 Assignments</h1>
      </header>

      <div className="flex flex-col gap-8">
        {/* Pending Assignments */}
        <section className="w-full">
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Pending Assignments ({pendingAssignments.length})</h2>
          {pendingAssignments.length === 0 ? (
            <div className="glass-card">
              <p className="text-center text-[var(--muted)] p-8">No pending assignments</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {pendingAssignments.map(assignment => {
                const daysLeft = getDaysUntilDue(assignment.dueDate)
                return (
                  <div key={assignment.id} className="glass-card">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--text)] mb-1">{assignment.title}</h3>
                        <p className="text-[var(--muted)] text-sm">{assignment.subject}</p>
                      </div>
                      <span 
                        className="py-[0.375rem] px-[0.875rem] rounded-[20px] text-xs font-semibold text-white whitespace-nowrap" 
                        style={{ 
                          background: daysLeft <= 2 ? '#ef4444' : daysLeft <= 5 ? '#f59e0b' : 'var(--primary)' 
                        }}
                      >
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                      </span>
                    </div>
                    <p className="text-[var(--text)] leading-relaxed mb-6">{assignment.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-[rgba(255,255,255,0.1)]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[var(--muted)] text-sm">Due:</span>
                        <span className="text-[var(--text)] font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <button className="btn-primary">Submit Assignment</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Submitted Assignments */}
        <section className="w-full">
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Submitted Assignments ({submittedAssignments.length})</h2>
          {submittedAssignments.length === 0 ? (
            <div className="glass-card">
              <p className="text-center text-[var(--muted)] p-8">No submitted assignments yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {submittedAssignments.map(assignment => (
                <div key={assignment.id} className="glass-card">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--text)] mb-1">{assignment.title}</h3>
                      <p className="text-[var(--muted)] text-sm">{assignment.subject}</p>
                    </div>
                    <span className="py-[0.375rem] px-[0.875rem] rounded-[20px] text-xs font-semibold text-white whitespace-nowrap" style={{ background: '#10b981' }}>Submitted</span>
                  </div>
                  <p className="text-[var(--text)] leading-relaxed mb-6">{assignment.description}</p>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[var(--muted)] text-sm">Due Date:</span>
                      <span className="text-[var(--text)] font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[var(--muted)] text-sm">Submitted On:</span>
                      <span className="text-[var(--text)] font-medium">{assignment.submittedDate && new Date(assignment.submittedDate).toLocaleDateString()}</span>
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
