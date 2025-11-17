'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import Navbar from '@/components/Navbar'
import QuizGame from '@/components/QuizGame'
import Leaderboard from '@/components/Leaderboard'
import { Subject, quizSubjects, saveScore } from '@/lib/quiz-data'

type GameState = 'subject-selection' | 'playing' | 'leaderboard'

export default function QuizPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState>('subject-selection')
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [currentScore, setCurrentScore] = useState<{
    score: number
    correctAnswers: number
    totalQuestions: number
    timeTaken: number
    subject: string
  } | undefined>(undefined)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  useEffect(() => {
    // Get player name from session or localStorage
    if (session?.user) {
      setPlayerName(session.user.name || session.user.email || 'Anonymous')
    } else {
      const savedName = localStorage.getItem('quiz_player_name')
      if (savedName) {
        setPlayerName(savedName)
      }
    }
  }, [session])

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject)
    setGameState('playing')
  }

  const handleQuizComplete = (score: number, correctAnswers: number, timeTaken: number) => {
    if (selectedSubject) {
      const scoreData = {
        score,
        correctAnswers,
        totalQuestions: selectedSubject.questions.length,
        timeTaken,
        subject: selectedSubject.id
      }
      
      setCurrentScore(scoreData)
      
      // Save to leaderboard
      saveScore({
        name: playerName,
        score,
        subject: selectedSubject.id,
        correctAnswers,
        totalQuestions: selectedSubject.questions.length,
        timeTaken
      })
      
      setGameState('leaderboard')
    }
  }

  const handlePlayAgain = () => {
    setCurrentScore(undefined)
    setGameState('playing')
  }

  const handleChangeSubject = () => {
    setCurrentScore(undefined)
    setSelectedSubject(null)
    setGameState('subject-selection')
  }

  const handleViewLeaderboard = () => {
    setGameState('leaderboard')
  }

  const handleBackToSubjects = () => {
    setCurrentScore(undefined)
    setSelectedSubject(null)
    setGameState('subject-selection')
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[1200px] mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-3">
            ❓ EduVerse Quiz Challenge
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Test your knowledge across different subjects and climb the leaderboard!
          </p>
        </div>

        {/* Subject Selection */}
        {gameState === 'subject-selection' && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-[rgba(15,23,36,0.4)] backdrop-blur-[12px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] mb-6">
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Choose Your Subject</h2>
              <p className="text-[var(--muted)]">
                Each quiz contains 10 questions. Answer correctly and quickly to maximize your score!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {quizSubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  className="group bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border-2 border-[rgba(255,255,255,0.08)] hover:border-[rgba(190,39,245,0.5)] transition-all hover:scale-105 hover:shadow-[0_8px_32px_rgba(190,39,245,0.3)] text-left"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-[12px] flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${subject.color}30` }}
                    >
                      {subject.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-[var(--muted)] mb-3">
                        {subject.questions.length} questions
                      </p>
                      <div className="flex gap-2">
                        {['Easy', 'Medium', 'Hard'].map((difficulty) => {
                          const count = subject.questions.filter(
                            q => q.difficulty === difficulty.toLowerCase()
                          ).length
                          return (
                            <span
                              key={difficulty}
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: `${subject.color}20`,
                                color: subject.color
                              }}
                            >
                              {count} {difficulty}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">
                      Max Score: {subject.questions.reduce((sum, q) => sum + q.points, 0)} pts
                    </span>
                    <span
                      className="text-sm font-semibold group-hover:translate-x-2 transition-transform"
                      style={{ color: subject.color }}
                    >
                      Start Quiz →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleViewLeaderboard}
                className="px-6 py-3 rounded-[12px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)] transition-all font-semibold"
              >
                🏆 View Leaderboard
              </button>
            </div>
          </div>
        )}

        {/* Quiz Game */}
        {gameState === 'playing' && selectedSubject && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <QuizGame
              subject={selectedSubject}
              onComplete={handleQuizComplete}
              onExit={handleBackToSubjects}
            />
          </div>
        )}

        {/* Leaderboard */}
        {gameState === 'leaderboard' && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <Leaderboard
              currentScore={currentScore}
              onPlayAgain={handlePlayAgain}
              onChangeSubject={handleChangeSubject}
            />
            {!currentScore && (
              <div className="text-center mt-6">
                <button
                  onClick={handleBackToSubjects}
                  className="px-6 py-3 rounded-[12px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)] transition-all font-semibold"
                >
                  ← Back to Subjects
                </button>
              </div>
            )}
          </div>
        )}

        {/* Game Instructions */}
        {gameState === 'subject-selection' && (
          <div className="mt-8 bg-[rgba(190,39,245,0.05)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(190,39,245,0.2)]">
            <h3 className="text-lg font-bold text-[var(--text)] mb-3">📋 How to Play</h3>
            <ul className="space-y-2 text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>Choose a subject and answer 10 questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>You have 30 seconds per question</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>Easy questions: 10 points, Medium: 15 points, Hard: 20 points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>Compete with others on the leaderboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>Top 3 players get special badges! 🥇 🥈 🥉</span>
              </li>
            </ul>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-10%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
