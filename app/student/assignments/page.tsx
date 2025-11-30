'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import Navbar from '@/components/Navbar'
import VerificationChecker from '@/components/VerificationChecker'

interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: string
  maxMarks: number | null
  course: {
    id: string
    title: string
    code: string
    teacher: { name: string }
  }
  submissions: Array<{
    id: string
    submittedAt: string
    grade: number | null
    feedback: string | null
    fileUrl: string | null
  }>
}

export default function StudentAssignmentsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionContent, setSubmissionContent] = useState('')
  const [submissionFile, setSubmissionFile] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'student')) {
      router.push('/sign-in')
      return
    }
    
    if (session?.user.role === 'student') {
      fetchAssignments()
    }
  }, [session, isPending, router])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/student/assignments')
      const data = await response.json()
      
      if (response.ok) {
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/student/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: submissionContent,
          fileUrl: submissionFile
        })
      })

      if (response.ok) {
        alert('Assignment submitted successfully!')
        setSelectedAssignment(null)
        setSubmissionContent('')
        setSubmissionFile('')
        fetchAssignments()
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Failed to submit assignment')
    } finally {
      setIsSubmitting(false)
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

  const pendingAssignments = assignments.filter(a => a.submissions.length === 0 && new Date(a.dueDate) >= new Date())
  const submittedAssignments = assignments.filter(a => a.submissions.length > 0)
  const overdueAssignments = assignments.filter(a => a.submissions.length === 0 && new Date(a.dueDate) < new Date())

  return (
    <div className="min-h-screen">
      <VerificationChecker />
      <Navbar />

      <main className="max-w-[1400px] mx-auto p-8">
        <button
          onClick={() => router.push('/students')}
          className="mb-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-[2.5rem] font-bold text-[var(--text)] mb-8">📚 My Assignments</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <p className="text-sm text-[var(--muted)] mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-500">{pendingAssignments.length}</p>
          </div>
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <p className="text-sm text-[var(--muted)] mb-1">Submitted</p>
            <p className="text-3xl font-bold text-green-500">{submittedAssignments.length}</p>
          </div>
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <p className="text-sm text-[var(--muted)] mb-1">Overdue</p>
            <p className="text-3xl font-bold text-red-500">{overdueAssignments.length}</p>
          </div>
        </div>

        {/* Pending Assignments */}
        {pendingAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Pending Assignments</h2>
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] hover:border-orange-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{assignment.title}</h3>
                      <p className="text-sm text-[var(--muted)] mb-2">{assignment.course.code} • {assignment.course.title}</p>
                      {assignment.description && (
                        <p className="text-[var(--muted)] mb-4">{assignment.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xs bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full">
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      {assignment.maxMarks && (
                        <p className="text-sm text-[var(--muted)] mt-2">Max: {assignment.maxMarks} marks</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="px-6 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Submit Assignment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submitted Assignments */}
        {submittedAssignments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Submitted Assignments</h2>
            <div className="space-y-4">
              {submittedAssignments.map((assignment) => {
                const submission = assignment.submissions[0]
                return (
                  <div
                    key={assignment.id}
                    className="bg-[rgba(15,23,36,0.3)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{assignment.title}</h3>
                        <p className="text-sm text-[var(--muted)] mb-2">{assignment.course.code} • {assignment.course.title}</p>
                        <p className="text-sm text-[var(--muted)]">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        {submission.feedback && (
                          <div className="mt-3 p-3 bg-[rgba(255,255,255,0.03)] rounded-xl">
                            <p className="text-xs text-[var(--muted)] mb-1">Feedback:</p>
                            <p className="text-sm text-[var(--text)]">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {submission.grade !== null ? (
                          <div>
                            <span className="text-3xl font-bold text-green-500">{submission.grade}%</span>
                            <p className="text-xs text-[var(--muted)]">Graded</p>
                          </div>
                        ) : (
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full">
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {assignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--muted)] text-lg">No assignments yet</p>
          </div>
        )}
      </main>

      {/* Submit Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(15,23,36,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">{selectedAssignment.title}</h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              {selectedAssignment.course.code} • Due {new Date(selectedAssignment.dueDate).toLocaleString()}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  File URL (Optional)
                </label>
                <input
                  type="url"
                  value={submissionFile}
                  onChange={(e) => setSubmissionFile(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                  Content/Notes
                </label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={6}
                  placeholder="Add any notes or text content here..."
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAssignment(null)
                    setSubmissionContent('')
                    setSubmissionFile('')
                  }}
                  className="flex-1 px-6 py-3 border border-[rgba(255,255,255,0.1)] text-[var(--text)] rounded-xl font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!submissionContent && !submissionFile)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
