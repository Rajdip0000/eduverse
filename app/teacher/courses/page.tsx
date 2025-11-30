'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { sessionAtom } from '@/lib/auth-client'
import Navbar from '@/components/Navbar'
import VerificationChecker from '@/components/VerificationChecker'

interface Course {
  id: string
  title: string
  description?: string
  code: string
  credits: number
  semester?: string
  isActive: boolean
  department?: { name: string }
  _count: {
    enrollments: number
    assignments: number
  }
}

export default function TeacherCoursesPage() {
  const router = useRouter()
  const [{ data: session, isPending }] = useAtom(sessionAtom)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    credits: 3,
    semester: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'teacher')) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/teacher/courses')
      const data = await response.json()
      if (response.ok) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const response = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Course created successfully!' })
        setShowCreateModal(false)
        setFormData({ title: '', description: '', code: '', credits: 3, semester: '' })
        fetchCourses()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create course' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create course' })
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[var(--text)] mb-2">My Courses</h1>
            <p className="text-[var(--muted)]">Manage your courses and track student progress</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            + Create Course
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-16 bg-[rgba(15,23,36,0.3)] backdrop-blur-sm rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No courses yet</h3>
            <p className="text-[var(--muted)] mb-6">Create your first course to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/teacher/courses/${course.id}`)}
                className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--text)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">{course.code}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    course.isActive 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {course.description && (
                  <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  <div>
                    <p className="text-2xl font-bold text-[var(--primary)]">
                      {course._count.enrollments}
                    </p>
                    <p className="text-xs text-[var(--muted)]">Students</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent)]">
                      {course._count.assignments}
                    </p>
                    <p className="text-xs text-[var(--muted)]">Assignments</p>
                  </div>
                </div>

                {course.semester && (
                  <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                    <p className="text-sm text-[var(--muted)]">
                      <span className="font-semibold">Semester:</span> {course.semester}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      <span className="font-semibold">Credits:</span> {course.credits}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(15,23,36,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Create New Course</h2>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Course Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g., CS101"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="Course description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                    min="1"
                    max="6"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g., Fall 2025"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ title: '', description: '', code: '', credits: 3, semester: '' })
                    setMessage(null)
                  }}
                  className="flex-1 px-6 py-3 border border-[rgba(255,255,255,0.1)] text-[var(--text)] rounded-xl font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
