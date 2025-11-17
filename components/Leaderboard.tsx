'use client'

import { useState, useEffect } from 'react'
import { LeaderboardEntry, getTopScores, quizSubjects } from '@/lib/quiz-data'

interface LeaderboardProps {
  currentScore?: {
    score: number
    correctAnswers: number
    totalQuestions: number
    timeTaken: number
    subject: string
  }
  onPlayAgain: () => void
  onChangeSubject: () => void
}

export default function Leaderboard({ currentScore, onPlayAgain, onChangeSubject }: LeaderboardProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [animatedScores, setAnimatedScores] = useState<number[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    loadLeaderboard()
  }, [selectedSubject])

  useEffect(() => {
    if (currentScore) {
      // Trigger confetti animation for good scores
      if (currentScore.score > 100) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }
  }, [currentScore])

  const loadLeaderboard = () => {
    const scores = selectedSubject === 'all' 
      ? getTopScores(undefined, 10)
      : getTopScores(selectedSubject, 10)
    
    setLeaderboard(scores)
    
    // Animate scores counting up
    setAnimatedScores(new Array(scores.length).fill(0))
    scores.forEach((entry, index) => {
      let current = 0
      const increment = entry.score / 30
      const timer = setInterval(() => {
        current += increment
        if (current >= entry.score) {
          current = entry.score
          clearInterval(timer)
        }
        setAnimatedScores(prev => {
          const newScores = [...prev]
          newScores[index] = Math.round(current)
          return newScores
        })
      }, 20)
    })
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#fbbf24'
      case 2: return '#94a3b8'
      case 3: return '#cd7f32'
      default: return 'var(--muted)'
    }
  }

  const getSubjectInfo = (subjectId: string) => {
    return quizSubjects.find(s => s.id === subjectId)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#10b981'
    if (accuracy >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-[confetti_3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                backgroundColor: ['#BE27F5', '#A820D9', '#10b981', '#f59e0b', '#ec4899'][i % 5],
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      {/* Current Score Card */}
      {currentScore && (
        <div className="bg-gradient-to-br from-[rgba(190,39,245,0.2)] to-[rgba(168,32,217,0.2)] backdrop-blur-[12px] p-8 rounded-[16px] border-2 border-[var(--primary)] mb-6 shadow-[0_10px_40px_rgba(190,39,245,0.3)] animate-[slideIn_0.5s_ease-out]">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-[bounce_1s_ease-in-out_3]">
              {currentScore.score >= 150 ? '🏆' : currentScore.score >= 100 ? '🎉' : currentScore.score >= 50 ? '👏' : '💪'}
            </div>
            <h2 className="text-3xl font-bold text-[var(--text)] mb-2">
              {currentScore.score >= 150 ? 'Outstanding!' : currentScore.score >= 100 ? 'Great Job!' : currentScore.score >= 50 ? 'Good Effort!' : 'Keep Trying!'}
            </h2>
            <p className="text-[var(--muted)]">
              You scored {currentScore.score} points in {getSubjectInfo(currentScore.subject)?.name}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--primary)] mb-1">{currentScore.score}</div>
              <div className="text-xs text-[var(--muted)]">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {currentScore.correctAnswers}/{currentScore.totalQuestions}
              </div>
              <div className="text-xs text-[var(--muted)]">Correct</div>
            </div>
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: getAccuracyColor((currentScore.correctAnswers / currentScore.totalQuestions) * 100) }}
              >
                {Math.round((currentScore.correctAnswers / currentScore.totalQuestions) * 100)}%
              </div>
              <div className="text-xs text-[var(--muted)]">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--accent)] mb-1">
                {formatTime(currentScore.timeTaken)}
              </div>
              <div className="text-xs text-[var(--muted)]">Time</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-6 py-3 rounded-[12px] font-semibold hover:opacity-90 transition-all shadow-[0_4px_15px_rgba(190,39,245,0.4)]"
            >
              Play Again
            </button>
            <button
              onClick={onChangeSubject}
              className="flex-1 px-6 py-3 rounded-[12px] border-2 border-[var(--primary)] text-[var(--primary)] font-semibold hover:bg-[rgba(190,39,245,0.1)] transition-all"
            >
              Change Subject
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Header */}
      <div className="bg-[rgba(15,23,36,0.4)] backdrop-blur-[12px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-1">🏆 Leaderboard</h2>
            <p className="text-sm text-[var(--muted)]">Top performers across all subjects</p>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-all ${
              selectedSubject === 'all'
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-[0_4px_15px_rgba(190,39,245,0.3)]'
                : 'border border-[rgba(255,255,255,0.1)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            All Subjects
          </button>
          {quizSubjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-all ${
                selectedSubject === subject.id
                  ? 'text-white shadow-[0_4px_15px_rgba(190,39,245,0.3)]'
                  : 'border border-[rgba(255,255,255,0.1)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]'
              }`}
              style={selectedSubject === subject.id ? {
                background: `linear-gradient(to right, ${subject.color}, ${subject.color}dd)`
              } : {}}
            >
              {subject.icon} {subject.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-12 rounded-[16px] border border-[rgba(255,255,255,0.06)] text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-[var(--muted)]">No scores yet. Be the first to play!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const subjectInfo = getSubjectInfo(entry.subject)
            const accuracy = (entry.correctAnswers / entry.totalQuestions) * 100
            const rank = index + 1

            return (
              <div
                key={entry.id}
                className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-4 rounded-[12px] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(190,39,245,0.3)] transition-all group animate-[slideIn_0.5s_ease-out]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
                    style={{
                      background: rank <= 3 
                        ? `linear-gradient(135deg, ${getRankColor(rank)}, ${getRankColor(rank)}dd)`
                        : 'rgba(255,255,255,0.1)',
                      color: rank <= 3 ? 'white' : getRankColor(rank)
                    }}
                  >
                    {getRankIcon(rank)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--text)] truncate">{entry.name}</h3>
                      {subjectInfo && (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${subjectInfo.color}20`,
                            color: subjectInfo.color
                          }}
                        >
                          {subjectInfo.icon} {subjectInfo.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                      <span>{entry.correctAnswers}/{entry.totalQuestions} correct</span>
                      <span>•</span>
                      <span style={{ color: getAccuracyColor(accuracy) }}>
                        {Math.round(accuracy)}% accuracy
                      </span>
                      <span>•</span>
                      <span>{formatTime(entry.timeTaken)}</span>
                      <span>•</span>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div
                      className="text-3xl font-bold mb-1"
                      style={{ color: rank <= 3 ? getRankColor(rank) : 'var(--primary)' }}
                    >
                      {animatedScores[index] || 0}
                    </div>
                    <div className="text-xs text-[var(--muted)]">points</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${accuracy}%`,
                      background: `linear-gradient(to right, ${getAccuracyColor(accuracy)}, ${getAccuracyColor(accuracy)}dd)`
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
