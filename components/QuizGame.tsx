'use client'

import { useState, useEffect } from 'react'
import { Question, Subject, quizSubjects } from '@/lib/quiz-data'

interface QuizGameProps {
  subject: Subject
  onComplete: (score: number, correctAnswers: number, timeTaken: number) => void
  onExit: () => void
}

export default function QuizGame({ subject, onComplete, onExit }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [startTime] = useState(Date.now())
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(subject.questions.length).fill(false)
  )

  const currentQuestion = subject.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === subject.questions.length - 1

  // Timer
  useEffect(() => {
    if (timeLeft === 0) {
      handleNextQuestion()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points)
      setCorrectAnswers(prev => prev + 1)
    }

    const newAnswered = [...answeredQuestions]
    newAnswered[currentQuestionIndex] = true
    setAnsweredQuestions(newAnswered)

    setShowResult(true)

    setTimeout(() => {
      handleNextQuestion()
    }, 1500)
  }

  const handleNextQuestion = () => {
    setShowResult(false)
    setSelectedAnswer(null)
    setTimeLeft(30)

    if (isLastQuestion) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      onComplete(score, correctAnswers, timeTaken)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const getAnswerClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'border-[var(--primary)] bg-[rgba(190,39,245,0.2)]'
        : 'border-[rgba(255,255,255,0.1)] hover:border-[var(--primary)] hover:bg-[rgba(190,39,245,0.1)]'
    }

    if (index === currentQuestion.correctAnswer) {
      return 'border-green-500 bg-[rgba(16,185,129,0.2)]'
    }

    if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
      return 'border-red-500 bg-[rgba(239,68,68,0.2)]'
    }

    return 'border-[rgba(255,255,255,0.1)] opacity-50'
  }

  const progressPercentage = ((currentQuestionIndex + 1) / subject.questions.length) * 100

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="bg-[rgba(15,23,36,0.4)] backdrop-blur-[12px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{subject.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text)] m-0">{subject.name} Quiz</h2>
              <p className="text-sm text-[var(--muted)] m-0">
                Question {currentQuestionIndex + 1} of {subject.questions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-[10px] border border-[rgba(255,255,255,0.1)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            Exit Quiz
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--muted)]">Progress</span>
            <span className="text-[var(--primary)] font-semibold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--primary)]">{score}</div>
            <div className="text-xs text-[var(--muted)]">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: subject.color }}>
              {correctAnswers}/{currentQuestionIndex + (selectedAnswer !== null ? 1 : 0)}
            </div>
            <div className="text-xs text-[var(--muted)]">Correct</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}
            >
              {timeLeft}s
            </div>
            <div className="text-xs text-[var(--muted)]">Time Left</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[rgba(15,23,36,0.4)] backdrop-blur-[12px] p-8 rounded-[16px] border border-[rgba(255,255,255,0.08)] mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-xl font-bold text-white shadow-[0_4px_15px_rgba(190,39,245,0.4)]">
            {currentQuestionIndex + 1}
          </div>
          <div className="flex-1">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ 
                backgroundColor: `${subject.color}20`,
                color: subject.color
              }}
            >
              {currentQuestion.difficulty.toUpperCase()} • {currentQuestion.points} pts
            </div>
            <h3 className="text-xl font-semibold text-[var(--text)] leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full text-left p-4 rounded-[12px] border-2 transition-all duration-300 ${getAnswerClass(index)} ${
                selectedAnswer === null ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                    showResult && index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-500 text-white'
                      : showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
                      ? 'border-red-500 bg-red-500 text-white'
                      : selectedAnswer === index
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-[rgba(255,255,255,0.3)] text-[var(--muted)]'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-[var(--text)] font-medium">{option}</span>
                {showResult && index === currentQuestion.correctAnswer && (
                  <span className="ml-auto text-green-500">✓</span>
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <span className="ml-auto text-red-500">✗</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Result Message */}
        {showResult && (
          <div
            className={`mt-6 p-4 rounded-[12px] border-2 animate-[fadeIn_0.3s_ease] ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'border-green-500 bg-[rgba(16,185,129,0.1)]'
                : 'border-red-500 bg-[rgba(239,68,68,0.1)]'
            }`}
          >
            <p className={`font-semibold ${
              selectedAnswer === currentQuestion.correctAnswer ? 'text-green-500' : 'text-red-500'
            }`}>
              {selectedAnswer === currentQuestion.correctAnswer
                ? `🎉 Correct! +${currentQuestion.points} points`
                : `😔 Wrong answer. The correct answer was: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
            </p>
          </div>
        )}
      </div>

      {/* Question Indicators */}
      <div className="flex flex-wrap gap-2 justify-center">
        {subject.questions.map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              index === currentQuestionIndex
                ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white scale-110 shadow-[0_4px_15px_rgba(190,39,245,0.4)]'
                : answeredQuestions[index]
                ? 'bg-green-500 text-white'
                : 'bg-[rgba(255,255,255,0.1)] text-[var(--muted)]'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
