'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAtom } from 'jotai'
import { sessionAtom } from '@/lib/auth-client'
import Navbar from '@/components/Navbar'
import VerificationChecker from '@/components/VerificationChecker'

interface Student {
  id: string
  studentId: string
  student: {
    id: string
    name: string
    email: string
    image?: string
  }
  stats?: {
    totalSubmissions: number
    gradedSubmissions: number
    averageGrade: number | null
    attendancePercentage: number
    totalClasses: number
    presentClasses: number
  }
}

interface Assignment {
  id: string
  title: string
  dueDate: string
  maxMarks: number
  _count: {
    submissions: number
  }
}

interface Course {
  id: string
  title: string
  code: string
  description?: string
  credits: number
  semester?: string
  isActive: boolean
  department?: { name: string }
  enrollments: Student[]
  assignments: Assignment[]
  _count: {
    enrollments: number
    assignments: number
    attendances: number
  }
}

type Tab = 'overview' | 'students' | 'assignments' | 'attendance'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [{ data: session, isPending }] = useAtom(sessionAtom)
  const [course, setCourse] = useState<Course | null>(null)
  const [studentsWithStats, setStudentsWithStats] = useState<Student[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100
  })
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState<{[key: string]: 'PRESENT' | 'ABSENT' | 'LATE'}>({})
  const [isSavingAttendance, setIsSavingAttendance] = useState(false)

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'teacher')) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  useEffect(() => {
    fetchCourse()
  }, [params.id])

  useEffect(() => {
    if (activeTab === 'students' && course) {
      fetchStudentsWithStats()
    }
  }, [activeTab, course])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/teacher/courses/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudentsWithStats = async () => {
    try {
      const response = await fetch(`/api/teacher/students?courseId=${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setStudentsWithStats(data.students)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignmentForm,
          courseId: params.id,
        }),
      })

      if (response.ok) {
        setShowAssignmentModal(false)
        setAssignmentForm({ title: '', description: '', dueDate: '', maxMarks: 100 })
        fetchCourse()
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Course not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <VerificationChecker />
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto p-8">
        <button
          onClick={() => router.push('/teacher/courses')}
          className="mb-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Back to Courses
        </button>

        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text)] mb-2">{course.title}</h1>
              <p className="text-[var(--muted)]">{course.code} • {course.credits} Credits</p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              course.isActive 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-gray-500/20 text-gray-500'
            }`}>
              {course.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
          {course.description && (
            <p className="text-[var(--muted)]">{course.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[rgba(255,255,255,0.08)]">
          {(['overview', 'students', 'assignments', 'attendance'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
              <p className="text-3xl font-bold text-[var(--primary)] mb-2">
                {course._count.enrollments}
              </p>
              <p className="text-[var(--muted)]">Enrolled Students</p>
            </div>
            <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
              <p className="text-3xl font-bold text-[var(--accent)] mb-2">
                {course._count.assignments}
              </p>
              <p className="text-[var(--muted)]">Assignments</p>
            </div>
            <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
              <p className="text-3xl font-bold text-blue-500 mb-2">
                {course._count.attendances}
              </p>
              <p className="text-[var(--muted)]">Attendance Records</p>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
                Enrolled Students ({studentsWithStats.length})
              </h2>
            </div>
            <div className="space-y-4">
              {studentsWithStats.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-lg">
                        {enrollment.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                          {enrollment.student.name}
                        </h3>
                        <p className="text-sm text-[var(--muted)]">{enrollment.student.email}</p>
                      </div>
                    </div>
                    {enrollment.stats && (
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[var(--primary)]">
                            {enrollment.stats.averageGrade !== null ? `${enrollment.stats.averageGrade}%` : 'N/A'}
                          </p>
                          <p className="text-xs text-[var(--muted)]">Avg Grade</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-500">
                            {enrollment.stats.attendancePercentage}%
                          </p>
                          <p className="text-xs text-[var(--muted)]">Attendance</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[var(--accent)]">
                            {enrollment.stats.gradedSubmissions}/{enrollment.stats.totalSubmissions}
                          </p>
                          <p className="text-xs text-[var(--muted)]">Graded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text)]">
                Assignments ({course.assignments.length})
              </h2>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                + Create Assignment
              </button>
            </div>
            <div className="space-y-4">
              {course.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}
                  className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)]">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[var(--primary)] mb-1">
                        {assignment._count.submissions}
                      </p>
                      <p className="text-xs text-[var(--muted)]">Submissions</p>
                      <p className="text-sm text-[var(--muted)] mt-2">
                        Max: {assignment.maxMarks} marks
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text)]">
                Attendance Management
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => {
                    setAttendanceDate(e.target.value)
                    setAttendanceRecords({})
                  }}
                  className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
                <button
                  onClick={async () => {
                    setIsSavingAttendance(true)
                    try {
                      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
                        studentId,
                        status,
                        date: attendanceDate
                      }))
                      
                      const response = await fetch('/api/teacher/attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ courseId: params.id, records })
                      })
                      
                      if (response.ok) {
                        alert('Attendance saved successfully!')
                        setAttendanceRecords({})
                      }
                    } catch (error) {
                      console.error('Error saving attendance:', error)
                      alert('Failed to save attendance')
                    } finally {
                      setIsSavingAttendance(false)
                    }
                  }}
                  disabled={Object.keys(attendanceRecords).length === 0 || isSavingAttendance}
                  className="px-6 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>

            <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
              <div className="space-y-3">
                {course.enrollments.map((enrollment) => {
                  const status = attendanceRecords[enrollment.student.id]
                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-lg">
                          {enrollment.student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text)]">
                            {enrollment.student.name}
                          </h3>
                          <p className="text-sm text-[var(--muted)]">{enrollment.student.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAttendanceRecords(prev => ({ ...prev, [enrollment.student.id]: 'PRESENT' }))}
                          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                            status === 'PRESENT'
                              ? 'bg-green-500 text-white'
                              : 'border border-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setAttendanceRecords(prev => ({ ...prev, [enrollment.student.id]: 'LATE' }))}
                          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                            status === 'LATE'
                              ? 'bg-yellow-500 text-white'
                              : 'border border-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => setAttendanceRecords(prev => ({ ...prev, [enrollment.student.id]: 'ABSENT' }))}
                          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                            status === 'ABSENT'
                              ? 'bg-red-500 text-white'
                              : 'border border-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {course.enrollments.length === 0 && (
                <p className="text-center text-[var(--muted)] py-8">
                  No students enrolled in this course yet
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(15,23,36,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Create Assignment</h2>
            
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Description
                </label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={assignmentForm.maxMarks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: parseInt(e.target.value) || 100 })}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false)
                    setAssignmentForm({ title: '', description: '', dueDate: '', maxMarks: 100 })
                  }}
                  className="flex-1 px-6 py-3 border border-[rgba(255,255,255,0.1)] text-[var(--text)] rounded-xl font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
