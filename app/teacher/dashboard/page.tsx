'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import VerificationChecker from '@/components/VerificationChecker'

interface DashboardStats {
  activeCourses: number
  totalStudents: number
  pendingSubmissions: number
  todaysClasses: number
}

interface Assignment {
  id: string
  title: string
  createdAt: string
  course: {
    title: string
    code: string
  }
  _count: {
    submissions: number
  }
}

interface Submission {
  id: string
  submittedAt: string
  student: {
    name: string
    email: string
  }
  assignment: {
    title: string
    course: {
      title: string
    }
  }
}

export default function TeacherDashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    activeCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    todaysClasses: 0,
  })
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'teacher')) {
      router.push('/sign-in')
      return
    }
    
    if (session?.user.role === 'teacher') {
      fetchDashboardData()
    }
  }, [session, isPending, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/teacher/dashboard')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
        setRecentAssignments(data.recentAssignments)
        setRecentSubmissions(data.recentSubmissions)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

  return (
    <div className="min-h-screen">
      <VerificationChecker />
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[2.5rem] font-bold text-[var(--text)] mb-2">
            👨‍🏫 Teacher Dashboard
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Welcome back, {session.user.name}! Manage your courses and students.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(16,185,129,0.3)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-[rgba(16,185,129,0.2)] flex items-center justify-center text-3xl">
                👥
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Total Students</p>
                <p className="text-3xl font-bold text-[#10b981]">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(190,39,245,0.3)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-[rgba(190,39,245,0.2)] flex items-center justify-center text-3xl">
                📚
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-[var(--primary)]">{stats.activeCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,158,11,0.3)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-[rgba(245,158,11,0.2)] flex items-center justify-center text-3xl">
                📝
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Pending Reviews</p>
                <p className="text-3xl font-bold">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(59,130,246,0.3)] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-[rgba(59,130,246,0.2)] flex items-center justify-center text-3xl">
                📅
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Today's Classes</p>
                <p className="text-3xl font-bold">{stats.todaysClasses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => router.push('/teacher/courses')}
            className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group"
          >
            <div className="text-3xl mb-3">📝</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              Manage Courses
            </p>
          </button>

          <button 
            onClick={() => router.push('/teacher/courses')}
            className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group"
          >
            <div className="text-3xl mb-3">📚</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              Create Assignment
            </p>
          </button>

          <button className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group">
            <div className="text-3xl mb-3">✅</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              Mark Attendance
            </p>
          </button>

          <button className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group">
            <div className="text-3xl mb-3">📢</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              Send Announcement
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assignments */}
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">Recent Assignments</h3>
            <div className="space-y-3">
              {recentAssignments.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-4">No assignments yet</p>
              ) : (
                recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}
                    className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-[var(--text)]">{assignment.title}</p>
                      <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-1 rounded">
                        {assignment._count.submissions} submissions
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {assignment.course.code} • {assignment.course.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Created {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-4">No submissions yet</p>
              ) : (
                recentSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {submission.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">
                        {submission.student.name}
                      </p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {submission.assignment.title}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Placeholder for removed activity section */}
        <div className="hidden">
          <div className="space-y-3">
            {[
              { text: 'John Doe submitted Assignment: Algebra Basics', time: '5 minutes ago', type: 'submission' },
              { text: 'New comment on "Physics Chapter 3"', time: '1 hour ago', type: 'comment' },
              { text: '15 students joined your "Advanced Calculus" course', time: '2 hours ago', type: 'enrollment' },
              { text: 'Quiz "Trigonometry Quiz 1" deadline approaching', time: '3 hours ago', type: 'deadline' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-all">
                <div className="w-10 h-10 rounded-full bg-[rgba(190,39,245,0.2)] flex items-center justify-center text-xl flex-shrink-0">
                  {activity.type === 'submission' ? '📝' : activity.type === 'comment' ? '💬' : activity.type === 'enrollment' ? '👥' : '⏰'}
                </div>
                <div className="flex-1">
                  <p className="text-[var(--text)] mb-1">{activity.text}</p>
                  <span className="text-sm text-[var(--muted)]">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
