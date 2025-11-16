'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getQuestionsBySubject, type Question } from './questions'

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  time: number
  date: string
}

export default function QuizPage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<'start' | 'selectSubject' | 'playing' | 'finished'>('start')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  const subjects = [
    { name: 'Mathematics', icon: '🔢', color: '#3b82f6' },
    { name: 'Physics', icon: '⚛️', color: '#8b5cf6' },
    { name: 'Chemistry', icon: '🧪', color: '#10b981' },
    { name: 'Biology', icon: '🧬', color: '#f59e0b' },
    { name: 'Computer Science', icon: '💻', color: '#06b6d4' },
    { name: 'History', icon: '📜', color: '#ef4444' },
    { name: 'Geography', icon: '🌍', color: '#14b8a6' },
    { name: 'Literature', icon: '📚', color: '#ec4899' },
  ]

  useEffect(() => {
    // Load leaderboard from localStorage
    const saved = localStorage.getItem('quiz_leaderboard')
    if (saved) {
      setLeaderboard(JSON.parse(saved))
    }
  }, [])

  const startQuiz = () => {
    if (!playerName.trim()) {
      alert('Please enter your name to start the quiz!')
      return
    }
    setShowNameInput(false)
    setGameState('selectSubject')
  }

  const generateQuizQuestions = async (subject: string) => {
    setIsLoadingQuestions(true)
    setSelectedSubject(subject)
    
    // Get questions from the questions file
    const questionsFromFile = getQuestionsBySubject(subject)
    
    if (questionsFromFile.length >= 10) {
      // Use questions from file
      setQuizQuestions(questionsFromFile)
      setGameState('playing')
      setCurrentQuestion(0)
      setScore(0)
      setAnswers([])
      setStartTime(Date.now())
      setSelectedAnswer(null)
      setIsLoadingQuestions(false)
      return
    }
    
    // If not enough questions in file, generate with AI
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAhXoUUyorHo_sjQjsHUiQO7wI8_LsEj2I'
      
      const prompt = `Generate 10 multiple choice quiz questions about ${subject} for high school/college level students. Format each question EXACTLY as follows:

Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A/B/C/D]

Make sure questions are educational, clear, and challenging. Cover different topics within ${subject}.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (!response.ok) throw new Error('Failed to generate questions')

      const data = await response.json()
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      // Parse questions
      const questionBlocks = generatedText.split(/Q\d+:/).filter(Boolean)
      const parsedQuestions: Question[] = []

      questionBlocks.forEach((block: string, index: number) => {
        const lines = block.trim().split('\n').filter((line: string) => line.trim())
        if (lines.length < 6) return

        const questionText = lines[0].trim()
        const options = lines.slice(1, 5).map((line: string) => line.replace(/^[A-D]\)\s*/, '').trim())
        const correctLine = lines.find((line: string) => line.toLowerCase().includes('correct:'))
        const correctLetter = correctLine?.match(/[A-D]/i)?.[0]?.toUpperCase()
        const correctIndex = correctLetter ? correctLetter.charCodeAt(0) - 65 : 0

        if (questionText && options.length === 4) {
          parsedQuestions.push({
            id: index + 1,
            question: questionText,
            options: options,
            correctAnswer: correctIndex,
            category: subject
          })
        }
      })

      if (parsedQuestions.length >= 5) {
        setQuizQuestions(parsedQuestions.slice(0, 10))
        setGameState('playing')
        setCurrentQuestion(0)
        setScore(0)
        setAnswers([])
        setStartTime(Date.now())
        setSelectedAnswer(null)
      } else {
        throw new Error('Could not parse enough questions')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Failed to load quiz questions. Please try another subject.')
      setGameState('selectSubject')
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    const isCorrect = answerIndex === quizQuestions[currentQuestion].correctAnswer
    setAnswers([...answers, isCorrect])
    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        finishQuiz(isCorrect ? score + 1 : score)
      }
    }, 1500)
  }

  const finishQuiz = (finalScore: number) => {
    const endT = Date.now()
    setEndTime(endT)
    const timeTaken = Math.floor((endT - startTime) / 1000)

    const newEntry: LeaderboardEntry = {
      rank: 0,
      name: playerName,
      score: finalScore,
      time: timeTaken,
      date: new Date().toLocaleDateString()
    }

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return a.time - b.time
      })
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 20)

    setLeaderboard(updatedLeaderboard)
    localStorage.setItem('quiz_leaderboard', JSON.stringify(updatedLeaderboard))
    setGameState('finished')
  }

  const resetQuiz = () => {
    setGameState('start')
    setCurrentQuestion(0)
    setScore(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowNameInput(true)
    setPlayerName('')
  }

  const getOptionClass = (index: number) => {
    if (selectedAnswer === null) return 'flex items-center gap-4 px-6 py-5 rounded-[12px] bg-[rgba(255,255,255,0.03)] border-2 border-[rgba(255,255,255,0.1)] text-[var(--text)] text-lg cursor-pointer transition-all duration-300 text-left hover:translate-x-2 hover:border-[var(--primary)] hover:bg-[rgba(190,39,245,0.1)]'
    if (index === quizQuestions[currentQuestion].correctAnswer) {
      return 'flex items-center gap-4 px-6 py-5 rounded-[12px] text-[var(--text)] text-lg text-left border-2 border-[#10b981] bg-[rgba(16,185,129,0.15)] animate-[correctPulse_0.5s_ease]'
    }
    if (index === selectedAnswer) {
      return 'flex items-center gap-4 px-6 py-5 rounded-[12px] text-[var(--text)] text-lg text-left border-2 border-[#ef4444] bg-[rgba(239,68,68,0.15)] animate-[shake_0.5s_ease]'
    }
    return 'flex items-center gap-4 px-6 py-5 rounded-[12px] text-[var(--text)] text-lg text-left border-2 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] opacity-50 cursor-not-allowed'
  }

  return (
    <div className="min-h-screen p-8 max-w-[1400px] mx-auto">
      <header className="flex items-center gap-6 mb-8">
        <button 
          onClick={() => router.back()} 
          className="px-6 py-3 rounded-[12px] bg-[var(--card-bg)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-[var(--text)]">🎯 Daily Quiz Challenge</h1>
      </header>

      {gameState === 'start' && (
        <div className="animate-[fadeIn_0.5s_ease]">
          <div className="glass-card max-w-[600px] mx-auto text-center">
            <h2 className="text-3xl mb-4">Welcome to Quiz Arena!</h2>
            <p className="text-[var(--muted)] mb-8 text-lg">
              Test your knowledge with AI-generated questions. Answer 10 questions as quickly and accurately as possible!
            </p>
            
            {showNameInput && (
              <div className="mb-8">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full max-w-[400px] px-6 py-4 rounded-[12px] bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.1)] text-[var(--text)] text-lg text-center transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)]"
                  onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
                  autoFocus
                />
              </div>
            )}

            <button 
              onClick={startQuiz} 
              className="px-8 py-4 text-xl font-semibold rounded-[16px] bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] border-none text-white cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(190,39,245,0.4)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(190,39,245,0.6)] active:translate-y-0 active:shadow-[0_6px_20px_rgba(190,39,245,0.5)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.2)] before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
            >
              Start Quiz
            </button>

            <div className="mt-12 text-left p-6 bg-[rgba(255,255,255,0.02)] rounded-[12px] border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-[var(--text)] mb-4 text-xl">Rules:</h3>
              <ul className="list-none p-0 m-0">
                <li className="text-[var(--muted)] py-2 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--primary)] before:font-bold">Choose your subject and get AI-generated questions</li>
                <li className="text-[var(--muted)] py-2 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--primary)] before:font-bold">10 questions per quiz</li>
                <li className="text-[var(--muted)] py-2 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--primary)] before:font-bold">Each correct answer = 1 point</li>
                <li className="text-[var(--muted)] py-2 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--primary)] before:font-bold">Faster completion time = higher ranking</li>
                <li className="text-[var(--muted)] py-2 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--primary)] before:font-bold">Compete on the global leaderboard!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {gameState === 'selectSubject' && (
        <div className="animate-[fadeIn_0.5s_ease]">
          <div className="glass-card max-w-[800px] mx-auto text-center">
            <h2 className="text-3xl mb-4">Choose Your Subject</h2>
            <p className="text-[var(--muted)] mb-8">
              Select a subject to generate your personalized quiz
            </p>

            {isLoadingQuestions ? (
              <div className="p-12">
                <div className="inline-block w-[50px] h-[50px] border-[5px] border-[rgba(190,39,245,0.3)] border-t-[5px] border-t-[var(--primary)] rounded-full animate-spin" />
                <p className="mt-4 text-[var(--muted)]">
                  Generating quiz questions with AI...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mt-8">
                {subjects.map((subject) => (
                  <button
                    key={subject.name}
                    onClick={() => generateQuizQuestions(subject.name)}
                    className="bg-[var(--card-bg)] border-2 border-[rgba(255,255,255,0.1)] p-8 px-4 rounded-[16px] cursor-pointer transition-all duration-300 text-center hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(190,39,245,0.3)]"
                    style={{
                      background: `linear-gradient(135deg, ${subject.color}22, ${subject.color}11)`,
                      borderColor: `${subject.color}44`
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = subject.color
                      e.currentTarget.style.boxShadow = `0 10px 30px ${subject.color}44`
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = `${subject.color}44`
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="text-5xl mb-2">{subject.icon}</div>
                    <div className="text-lg font-semibold text-[var(--text)]">
                      {subject.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'playing' && quizQuestions.length > 0 && (
        <div className="animate-[fadeIn_0.5s_ease]">
          <div className="w-full h-2 bg-[rgba(255,255,255,0.05)] rounded overflow-hidden mb-8">
            <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300" style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }} />
          </div>

          <div className="bg-[var(--card-bg)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.1)] p-8 max-w-[800px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <span className="px-4 py-2 rounded-[20px] bg-[rgba(190,39,245,0.2)] text-[var(--primary)] text-sm font-semibold">{quizQuestions[currentQuestion].category}</span>
              <span className="text-[var(--muted)] text-sm font-medium">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
            </div>

            <h2 className="text-[1.75rem] font-semibold text-[var(--text)] mb-8 leading-[1.4]">{quizQuestions[currentQuestion].question}</h2>

            <div className="flex flex-col gap-4 mb-8">
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={getOptionClass(index)}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] font-bold text-[var(--primary)] flex-shrink-0">{String.fromCharCode(65 + index)}</span>
                  <span className="flex-1">{option}</span>
                  {selectedAnswer !== null && index === quizQuestions[currentQuestion].correctAnswer && (
                    <span className="text-2xl font-bold flex-shrink-0 text-[#10b981]">✓</span>
                  )}
                  {selectedAnswer === index && index !== quizQuestions[currentQuestion].correctAnswer && (
                    <span className="text-2xl font-bold flex-shrink-0 text-[#ef4444]">✕</span>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center text-[var(--muted)] text-lg pt-4 border-t border-[rgba(255,255,255,0.1)]">
              Score: <strong className="text-[var(--primary)] text-xl">{score}</strong> / {currentQuestion + (selectedAnswer !== null ? 1 : 0)}
            </div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="animate-[fadeIn_0.5s_ease]">
          <div className="glass-card max-w-[800px] mx-auto">
            <div className="text-center mb-8 pb-8 border-b border-[rgba(255,255,255,0.1)]">
              <h2 className="text-4xl mb-2">🎉 Quiz Complete!</h2>
              <p className="text-[var(--muted)] mt-2">Here's how you performed, {playerName}</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-4">
              <div className="text-center p-6 bg-[rgba(255,255,255,0.02)] rounded-[12px] border border-[rgba(255,255,255,0.05)]">
                <div className="text-[var(--muted)] text-sm mb-2">Your Score</div>
                <div className="text-5xl font-bold my-2" style={{ color: score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444' }}>
                  {score}/{quizQuestions.length}
                </div>
                <div className="text-[var(--muted)] text-sm">{Math.round((score / quizQuestions.length) * 100)}%</div>
              </div>

              <div className="text-center p-6 bg-[rgba(255,255,255,0.02)] rounded-[12px] border border-[rgba(255,255,255,0.05)]">
                <div className="text-[var(--muted)] text-sm mb-2">Time Taken</div>
                <div className="text-5xl font-bold my-2 text-[var(--primary)]">
                  {Math.floor((endTime - startTime) / 1000)}s
                </div>
                <div className="text-[var(--muted)] text-sm">
                  {(Math.floor((endTime - startTime) / 1000) / quizQuestions.length).toFixed(1)}s per question
                </div>
              </div>

              <div className="text-center p-6 bg-[rgba(255,255,255,0.02)] rounded-[12px] border border-[rgba(255,255,255,0.05)]">
                <div className="text-[var(--muted)] text-sm mb-2">Your Rank</div>
                <div className="text-5xl font-bold my-2 text-[#BE27F5]">
                  #{leaderboard.find(e => e.name === playerName && e.score === score)?.rank || '?'}
                </div>
                <div className="text-[var(--muted)] text-sm">out of {leaderboard.length} players</div>
              </div>
            </div>

            <button onClick={resetQuiz} className="btn-primary mt-8 w-full">
              Play Again
            </button>
          </div>

          <div className="glass-card max-w-[800px] mx-auto mt-8">
            <h3 className="mb-6 text-2xl">🏆 Global Leaderboard</h3>
            
            {leaderboard.length === 0 ? (
              <p className="text-center text-[var(--muted)] p-8">
                No entries yet. Be the first to complete the quiz!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[80px_1fr_100px_100px_120px] gap-4 p-6 bg-[rgba(190,39,245,0.1)] rounded-lg font-semibold text-[var(--text)] mb-2">
                  <div>Rank</div>
                  <div>Player</div>
                  <div>Score</div>
                  <div>Time</div>
                  <div>Date</div>
                </div>
                {leaderboard.map((entry) => (
                  <div 
                    key={`${entry.name}-${entry.score}-${entry.time}`}
                    className={`grid grid-cols-[80px_1fr_100px_100px_120px] gap-4 p-6 border-b border-[rgba(255,255,255,0.05)] text-[var(--text)] items-center transition-all duration-300 hover:bg-[rgba(255,255,255,0.02)] ${entry.name === playerName && entry.score === score ? 'bg-[rgba(190,39,245,0.15)] border border-[var(--primary)] rounded-lg animate-[highlightPulse_2s_ease_infinite]' : ''}`}
                  >
                    <div className="text-2xl font-bold text-center">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `#${entry.rank}`}
                    </div>
                    <div className="font-semibold">{entry.name}</div>
                    <div className="text-[var(--primary)] font-semibold">{entry.score}/10</div>
                    <div className="text-[var(--muted)]">{entry.time}s</div>
                    <div className="text-[var(--muted)] text-sm">{entry.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
