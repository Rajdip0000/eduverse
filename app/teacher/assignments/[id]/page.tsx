'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAtom } from 'jotai'
import { sessionAtom } from '@/lib/auth-client'
import Navbar from '@/components/Navbar'
import VerificationChecker from '@/components/VerificationChecker'

interface Submission {
  id: string
  content: string
  fileUrl?: string
  submittedAt: string
  grade: number | null
  feedback?: string
  gradedAt?: string
  student: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface Assignment {
  id: string
  title: string
  description?: string
  dueDate: string
  maxMarks: number
  course: {
    id: string
    title: string
    code: string
  }
  submissions: Submission[]
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [{ data: session, isPending }] = useAtom(sessionAtom)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'teacher')) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  useEffect(() => {
    fetchAssignment()
  }, [params.id])

  useEffect(() => {
    if (selectedSubmission) {
      setGradeForm({
        grade: selectedSubmission.grade || 0,
        feedback: selectedSubmission.feedback || '',
      })
    }
  }, [selectedSubmission])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/teacher/assignments/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setAssignment(data.assignment)
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return

    setMessage(null)

    try {
      const response = await fetch(`/api/teacher/submissions/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeForm),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Submission graded successfully!' })
        setSelectedSubmission(null)
        fetchAssignment()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to grade submission' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to grade submission' })
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

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Assignment not found</p>
      </div>
    )
  }

  const gradedCount = assignment.submissions.filter((s) => s.grade !== null).length
  const ungradedCount = assignment.submissions.length - gradedCount

  return (
    <div className="min-h-screen">
      <VerificationChecker />
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto p-8">
        <button
          onClick={() => router.push(`/teacher/courses/${assignment.course.id}`)}
          className="mb-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Back to {assignment.course.title}
        </button>

        {message && (
          <div className={`p-4 rounded-xl mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2">{assignment.title}</h1>
          <p className="text-[var(--muted)] mb-4">
            {assignment.course.code} • Due: {new Date(assignment.dueDate).toLocaleString()} • Max Marks: {assignment.maxMarks}
          </p>
          {assignment.description && (
            <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
              <p className="text-[var(--text)]">{assignment.description}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <p className="text-3xl font-bold text-[var(--primary)] mb-2">
              {assignment.submissions.length}
            </p>
            <p className="text-[var(--muted)]">Total Submissions</p>
          </div>
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <p className="text-3xl font-bold text-green-500 mb-2">{gradedCount}</p>
            <p className="text-[var(--muted)]">Graded</p>
          </div>
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <p className="text-3xl font-bold text-orange-500 mb-2">{ungradedCount}</p>
            <p className="text-[var(--muted)]">Pending</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Submissions</h2>
          {assignment.submissions.length === 0 ? (
            <div className="text-center py-16 bg-[rgba(15,23,36,0.3)] backdrop-blur-sm rounded-2xl border border-[rgba(255,255,255,0.08)]">
              <p className="text-[var(--muted)]">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignment.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-lg">
                        {submission.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                          {submission.student.name}
                        </h3>
                        <p className="text-sm text-[var(--muted)] mb-2">{submission.student.email}</p>
                        <p className="text-sm text-[var(--muted)]">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-[var(--text)] mt-2">{submission.content}</p>
                        {submission.fileUrl && (
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block"
                          >
                            📎 View Attachment
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {submission.grade !== null ? (
                        <div>
                          <p className="text-3xl font-bold text-green-500 mb-1">
                            {submission.grade}/{assignment.maxMarks}
                          </p>
                          <p className="text-xs text-[var(--muted)] mb-3">
                            Graded on {new Date(submission.gradedAt!).toLocaleDateString()}
                          </p>
                          {submission.feedback && (
                            <div className="bg-[rgba(255,255,255,0.05)] p-3 rounded-lg text-left max-w-xs">
                              <p className="text-xs text-[var(--muted)] mb-1">Feedback:</p>
                              <p className="text-sm text-[var(--text)]">{submission.feedback}</p>
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="mt-3 px-4 py-2 text-sm border border-[rgba(255,255,255,0.1)] text-[var(--text)] rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                          >
                            Update Grade
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                        >
                          Grade Submission
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(15,23,36,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Grade Submission</h2>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-6 rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
                  {selectedSubmission.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{selectedSubmission.student.name}</p>
                  <p className="text-sm text-[var(--muted)]">{selectedSubmission.student.email}</p>
                </div>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                <p className="text-sm text-[var(--muted)] mb-2">Submission:</p>
                <p className="text-[var(--text)]">{selectedSubmission.content}</p>
                {selectedSubmission.fileUrl && (
                  <a
                    href={selectedSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block"
                  >
                    📎 View Attachment
                  </a>
                )}
              </div>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Grade (out of {assignment.maxMarks}) *
                </label>
                <input
                  type="number"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: parseInt(e.target.value) || 0 })}
                  min="0"
                  max={assignment.maxMarks}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Feedback
                </label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubmission(null)
                    setGradeForm({ grade: 0, feedback: '' })
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
                  Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
