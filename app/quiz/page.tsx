'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { sessionAtom } from '@/lib/auth-client'

export default function QuizPage() {
  const [{ data: session, isPending }] = useAtom(sessionAtom)
  const router = useRouter()

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/sign-in')
      } else if (session.user.role === 'student') {
        router.push('/student/quizzes')
      } else if (session.user.role === 'teacher') {
        router.push('/teacher/quizzes')
      } else {
        router.push('/students')
      }
    }
  }, [session, isPending, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to quizzes...</p>
      </div>
    </div>
  )
}
