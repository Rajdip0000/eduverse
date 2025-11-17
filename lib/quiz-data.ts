export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
}

export interface Subject {
  id: string
  name: string
  icon: string
  color: string
  questions: Question[]
}

export const quizSubjects: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '🔢',
    color: '#3b82f6',
    questions: [
      {
        id: 'math1',
        question: 'What is the value of π (pi) approximately?',
        options: ['3.14159', '2.71828', '1.41421', '1.61803'],
        correctAnswer: 0,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'math2',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'math3',
        question: 'What is the sum of angles in a triangle?',
        options: ['90°', '180°', '270°', '360°'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'math4',
        question: 'What is the square root of 144?',
        options: ['10', '11', '12', '13'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'math5',
        question: 'What is the value of 2³ + 3²?',
        options: ['15', '17', '19', '21'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'math6',
        question: 'What is the formula for the area of a circle?',
        options: ['2πr', 'πr²', 'πd', '2πr²'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'math7',
        question: 'What is the integral of 1/x?',
        options: ['ln|x| + C', 'x² + C', '1/x² + C', 'e^x + C'],
        correctAnswer: 0,
        difficulty: 'hard',
        points: 20
      },
      {
        id: 'math8',
        question: 'What is 15% of 200?',
        options: ['25', '30', '35', '40'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'math9',
        question: 'What is the Pythagorean theorem?',
        options: ['a² + b² = c²', 'a + b = c', 'a² - b² = c²', 'a × b = c'],
        correctAnswer: 0,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'math10',
        question: 'What is the value of log₁₀(1000)?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: '#10b981',
    questions: [
      {
        id: 'sci1',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Au', 'Gd', 'Ag'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'sci2',
        question: 'What is the speed of light in vacuum?',
        options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁷ m/s', '3 × 10⁹ m/s'],
        correctAnswer: 0,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'sci3',
        question: 'What is the atomic number of Carbon?',
        options: ['4', '6', '8', '12'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'sci4',
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'sci5',
        question: 'What is the pH of pure water?',
        options: ['5', '7', '9', '11'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'sci6',
        question: 'What is Newton\'s second law of motion?',
        options: ['F = ma', 'E = mc²', 'V = IR', 'PV = nRT'],
        correctAnswer: 0,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'sci7',
        question: 'What is the process by which plants make food?',
        options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Digestion'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'sci8',
        question: 'What is the smallest unit of life?',
        options: ['Atom', 'Molecule', 'Cell', 'Organ'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'sci9',
        question: 'What is the name of the first element in the periodic table?',
        options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'sci10',
        question: 'What is the theory that explains the origin of the universe?',
        options: ['Theory of Evolution', 'Big Bang Theory', 'String Theory', 'Quantum Theory'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      }
    ]
  },
  {
    id: 'programming',
    name: 'Programming',
    icon: '💻',
    color: '#8b5cf6',
    questions: [
      {
        id: 'prog1',
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
        correctAnswer: 0,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'prog2',
        question: 'Which programming language is known as the "language of the web"?',
        options: ['Python', 'Java', 'JavaScript', 'C++'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'prog3',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'prog4',
        question: 'What does CSS stand for?',
        options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'prog5',
        question: 'Which data structure uses LIFO principle?',
        options: ['Queue', 'Stack', 'Array', 'Tree'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'prog6',
        question: 'What is the output of: console.log(typeof NaN)?',
        options: ['"NaN"', '"number"', '"undefined"', '"object"'],
        correctAnswer: 1,
        difficulty: 'hard',
        points: 20
      },
      {
        id: 'prog7',
        question: 'What is Git?',
        options: ['A programming language', 'A version control system', 'A database', 'An IDE'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'prog8',
        question: 'What does API stand for?',
        options: ['Application Programming Interface', 'Advanced Programming Interface', 'Application Process Integration', 'Automated Programming Interface'],
        correctAnswer: 0,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'prog9',
        question: 'Which sorting algorithm has the best average-case time complexity?',
        options: ['Bubble Sort', 'Selection Sort', 'Quick Sort', 'Insertion Sort'],
        correctAnswer: 2,
        difficulty: 'hard',
        points: 20
      },
      {
        id: 'prog10',
        question: 'What is a closure in JavaScript?',
        options: ['A way to close the browser', 'A function with access to parent scope', 'A type of loop', 'A database connection'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      }
    ]
  },
  {
    id: 'history',
    name: 'History',
    icon: '📜',
    color: '#f59e0b',
    questions: [
      {
        id: 'hist1',
        question: 'When did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'hist2',
        question: 'Who was the first President of the United States?',
        options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'hist3',
        question: 'Which civilization built the pyramids?',
        options: ['Greeks', 'Romans', 'Egyptians', 'Mayans'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'hist4',
        question: 'When was the Declaration of Independence signed?',
        options: ['1774', '1775', '1776', '1777'],
        correctAnswer: 2,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'hist5',
        question: 'Who painted the Mona Lisa?',
        options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'hist6',
        question: 'What year did the Berlin Wall fall?',
        options: ['1987', '1988', '1989', '1990'],
        correctAnswer: 2,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'hist7',
        question: 'Who was the first person to walk on the moon?',
        options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'hist8',
        question: 'Which empire was ruled by Julius Caesar?',
        options: ['Greek Empire', 'Roman Empire', 'Persian Empire', 'Byzantine Empire'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'hist9',
        question: 'When did India gain independence?',
        options: ['1945', '1946', '1947', '1948'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'hist10',
        question: 'Who wrote "The Art of War"?',
        options: ['Confucius', 'Sun Tzu', 'Lao Tzu', 'Mencius'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      }
    ]
  },
  {
    id: 'general',
    name: 'General Knowledge',
    icon: '🌍',
    color: '#ec4899',
    questions: [
      {
        id: 'gen1',
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'gen2',
        question: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'gen3',
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctAnswer: 3,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'gen4',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'gen5',
        question: 'What is the tallest mountain in the world?',
        options: ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'],
        correctAnswer: 2,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'gen6',
        question: 'How many countries are there in the United Nations?',
        options: ['193', '195', '197', '200'],
        correctAnswer: 0,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'gen7',
        question: 'What is the longest river in the world?',
        options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'gen8',
        question: 'Which country has the largest population?',
        options: ['India', 'China', 'USA', 'Indonesia'],
        correctAnswer: 0,
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'gen9',
        question: 'What is the smallest country in the world?',
        options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      },
      {
        id: 'gen10',
        question: 'Which language is the most spoken worldwide?',
        options: ['English', 'Mandarin Chinese', 'Spanish', 'Hindi'],
        correctAnswer: 1,
        difficulty: 'medium',
        points: 15
      }
    ]
  }
]

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  subject: string
  date: number
  correctAnswers: number
  totalQuestions: number
  timeTaken: number
}

export const saveScore = (entry: Omit<LeaderboardEntry, 'id' | 'date'>): void => {
  const leaderboard = getLeaderboard()
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: Date.now()
  }
  leaderboard.push(newEntry)
  localStorage.setItem('quiz_leaderboard', JSON.stringify(leaderboard))
}

export const getLeaderboard = (): LeaderboardEntry[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('quiz_leaderboard')
  return data ? JSON.parse(data) : []
}

export const getTopScores = (subject?: string, limit: number = 10): LeaderboardEntry[] => {
  let leaderboard = getLeaderboard()
  if (subject) {
    leaderboard = leaderboard.filter(entry => entry.subject === subject)
  }
  return leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
