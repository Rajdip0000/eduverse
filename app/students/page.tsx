'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import Navbar from '@/components/Navbar'
import VerificationChecker from '@/components/VerificationChecker'

interface DashboardStats {
  enrolledCourses: number
  pendingAssignments: number
  attendancePercentage: number
  averageGrade: number | null
  totalSubmissions: number
  gradedSubmissions: number
}

interface Assignment {
  id: string
  title: string
  dueDate: string
  course: {
    title: string
    code: string
  }
}

interface Submission {
  id: string
  submittedAt: string
  grade: number | null
  assignment: {
    title: string
    course: {
      title: string
      code: string
    }
  }
}

export default function StudentsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    pendingAssignments: 0,
    attendancePercentage: 0,
    averageGrade: null,
    totalSubmissions: 0,
    gradedSubmissions: 0
  })
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'student')) {
      router.push('/sign-in')
      return
    }
    
    if (session?.user.role === 'student') {
      fetchDashboardData()
    }
  }, [session, isPending, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/student/dashboard')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
        setPendingAssignments(data.pendingAssignments)
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

  return (
    <div className="min-h-screen">
      <VerificationChecker />
      <Navbar />

      <main className="max-w-[1400px] mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-[2.5rem] font-bold text-[var(--text)] mb-2">
            👨‍🎓 Student Dashboard
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Welcome back, {session?.user.name}!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(16,185,129,0.3)] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-[rgba(16,185,129,0.2)] flex items-center justify-center text-3xl">
                📚
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,158,11,0.3)] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-[rgba(245,158,11,0.2)] flex items-center justify-center text-3xl">
                📝
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-500">{stats.pendingAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(59,130,246,0.3)] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-[rgba(59,130,246,0.2)] flex items-center justify-center text-3xl">
                ✅
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Attendance</p>
                <p className="text-3xl font-bold text-blue-500">{stats.attendancePercentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(190,39,245,0.3)] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-[rgba(190,39,245,0.2)] flex items-center justify-center text-3xl">
                🎯
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Avg Grade</p>
                <p className="text-3xl font-bold text-[var(--primary)]">
                  {stats.averageGrade !== null ? `${stats.averageGrade}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/student/assignments')}
            className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group"
          >
            <div className="text-3xl mb-3">📚</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              View Assignments
            </p>
          </button>

          <button
            onClick={() => router.push('/student/attendance')}
            className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group"
          >
            <div className="text-3xl mb-3">📊</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              Check Attendance
            </p>
          </button>

          <button
            onClick={() => router.push('/student/fees')}
            className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group"
          >
            <div className="text-3xl mb-3">💰</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              View Fees
            </p>
          </button>

          <button
            onClick={() => router.push('/student/notices')}
            className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all text-left group"
          >
            <div className="text-3xl mb-3">📢</div>
            <p className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              Read Notices
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Assignments */}
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">Pending Assignments</h3>
            <div className="space-y-3">
              {pendingAssignments.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-4">No pending assignments 🎉</p>
              ) : (
                pendingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => router.push(`/student/assignments`)}
                    className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-[var(--text)]">{assignment.title}</p>
                      <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded">
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {assignment.course.code} • {assignment.course.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-4">No submissions yet</p>
              ) : (
                recentSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-[var(--text)] text-sm">
                        {submission.assignment.title}
                      </p>
                      {submission.grade !== null ? (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded font-semibold">
                          {submission.grade}%
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {submission.assignment.course.code} • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
