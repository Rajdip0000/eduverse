export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  category: string
}

export const QUIZ_QUESTIONS_BY_SUBJECT: { [key: string]: Question[] } = {
  'Mathematics': [
    {
      id: 1,
      question: 'What is the derivative of x²?',
      options: ['x', '2x', 'x²', '2'],
      correctAnswer: 1,
      category: 'Mathematics'
    },
    {
      id: 2,
      question: 'What is the value of π (pi) approximately?',
      options: ['3.14', '2.71', '1.41', '1.73'],
      correctAnswer: 0,
      category: 'Mathematics'
    },
    {
      id: 3,
      question: 'What is the square root of 144?',
      options: ['10', '11', '12', '13'],
      correctAnswer: 2,
      category: 'Mathematics'
    },
    {
      id: 4,
      question: 'What is the formula for the area of a circle?',
      options: ['πr', 'πr²', '2πr', 'πd'],
      correctAnswer: 1,
      category: 'Mathematics'
    },
    {
      id: 5,
      question: 'What is the value of sin(90°)?',
      options: ['0', '0.5', '1', '√3/2'],
      correctAnswer: 2,
      category: 'Mathematics'
    },
    {
      id: 6,
      question: 'What is the sum of angles in a triangle?',
      options: ['90°', '180°', '270°', '360°'],
      correctAnswer: 1,
      category: 'Mathematics'
    },
    {
      id: 7,
      question: 'What is the factorial of 5?',
      options: ['24', '60', '120', '720'],
      correctAnswer: 2,
      category: 'Mathematics'
    },
    {
      id: 8,
      question: 'What is the slope of a horizontal line?',
      options: ['0', '1', '-1', 'Undefined'],
      correctAnswer: 0,
      category: 'Mathematics'
    },
    {
      id: 9,
      question: 'What is the quadratic formula?',
      options: ['x = -b ± √(b² - 4ac) / 2a', 'x = b² - 4ac', 'x = ax² + bx + c', 'x = √(b² + 4ac)'],
      correctAnswer: 0,
      category: 'Mathematics'
    },
    {
      id: 10,
      question: 'What is the value of log₁₀(100)?',
      options: ['1', '2', '10', '100'],
      correctAnswer: 1,
      category: 'Mathematics'
    }
  ],
  'Physics': [
    {
      id: 11,
      question: 'What is Newton\'s Second Law of Motion?',
      options: ['F = ma', 'E = mc²', 'v = u + at', 'PV = nRT'],
      correctAnswer: 0,
      category: 'Physics'
    },
    {
      id: 12,
      question: 'What is the speed of light in vacuum?',
      options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁴ m/s', '3 × 10² m/s'],
      correctAnswer: 0,
      category: 'Physics'
    },
    {
      id: 13,
      question: 'What is the unit of force?',
      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
      correctAnswer: 1,
      category: 'Physics'
    },
    {
      id: 14,
      question: 'What is the acceleration due to gravity on Earth?',
      options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'],
      correctAnswer: 1,
      category: 'Physics'
    },
    {
      id: 15,
      question: 'What is Ohm\'s Law?',
      options: ['V = IR', 'P = IV', 'E = VQ', 'R = ρL/A'],
      correctAnswer: 0,
      category: 'Physics'
    },
    {
      id: 16,
      question: 'What is the first law of thermodynamics?',
      options: ['Energy cannot be created or destroyed', 'Entropy always increases', 'Absolute zero is unattainable', 'Heat flows from hot to cold'],
      correctAnswer: 0,
      category: 'Physics'
    },
    {
      id: 17,
      question: 'What is the unit of power?',
      options: ['Newton', 'Joule', 'Watt', 'Pascal'],
      correctAnswer: 2,
      category: 'Physics'
    },
    {
      id: 18,
      question: 'What is the frequency of visible light approximately?',
      options: ['10¹² Hz', '10¹⁴ Hz', '10¹⁶ Hz', '10¹⁸ Hz'],
      correctAnswer: 1,
      category: 'Physics'
    },
    {
      id: 19,
      question: 'What is kinetic energy formula?',
      options: ['mgh', '½mv²', 'Fd', 'Pt'],
      correctAnswer: 1,
      category: 'Physics'
    },
    {
      id: 20,
      question: 'What is the charge of an electron?',
      options: ['-1.6 × 10⁻¹⁹ C', '+1.6 × 10⁻¹⁹ C', '-3.2 × 10⁻¹⁹ C', '0 C'],
      correctAnswer: 0,
      category: 'Physics'
    }
  ],
  'Chemistry': [
    {
      id: 21,
      question: 'Which element has the atomic number 6?',
      options: ['Oxygen', 'Nitrogen', 'Carbon', 'Hydrogen'],
      correctAnswer: 2,
      category: 'Chemistry'
    },
    {
      id: 22,
      question: 'What is the chemical formula for water?',
      options: ['CO2', 'H2O', 'O2', 'NaCl'],
      correctAnswer: 1,
      category: 'Chemistry'
    },
    {
      id: 23,
      question: 'What is the pH of pure water?',
      options: ['0', '7', '14', '1'],
      correctAnswer: 1,
      category: 'Chemistry'
    },
    {
      id: 24,
      question: 'What is Avogadro\'s number?',
      options: ['6.022 × 10²³', '3.14 × 10²³', '9.81 × 10²³', '1.6 × 10²³'],
      correctAnswer: 0,
      category: 'Chemistry'
    },
    {
      id: 25,
      question: 'What is the most abundant gas in Earth\'s atmosphere?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
      correctAnswer: 2,
      category: 'Chemistry'
    },
    {
      id: 26,
      question: 'What is the chemical symbol for Gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctAnswer: 2,
      category: 'Chemistry'
    },
    {
      id: 27,
      question: 'What type of bond involves sharing electrons?',
      options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
      correctAnswer: 1,
      category: 'Chemistry'
    },
    {
      id: 28,
      question: 'What is the chemical formula for table salt?',
      options: ['NaCl', 'KCl', 'CaCl2', 'MgCl2'],
      correctAnswer: 0,
      category: 'Chemistry'
    },
    {
      id: 29,
      question: 'What is the process of a solid turning directly into a gas?',
      options: ['Melting', 'Evaporation', 'Sublimation', 'Condensation'],
      correctAnswer: 2,
      category: 'Chemistry'
    },
    {
      id: 30,
      question: 'What is the lightest element?',
      options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'],
      correctAnswer: 1,
      category: 'Chemistry'
    }
  ],
  'Biology': [
    {
      id: 31,
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'],
      correctAnswer: 2,
      category: 'Biology'
    },
    {
      id: 32,
      question: 'What is the process by which plants make food?',
      options: ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'],
      correctAnswer: 1,
      category: 'Biology'
    },
    {
      id: 33,
      question: 'What is DNA\'s full form?',
      options: ['Deoxyribonucleic Acid', 'Diribonucleic Acid', 'Deoxyribose Acid', 'Dynamic Nuclear Acid'],
      correctAnswer: 0,
      category: 'Biology'
    },
    {
      id: 34,
      question: 'How many chromosomes do humans have?',
      options: ['23', '46', '48', '92'],
      correctAnswer: 1,
      category: 'Biology'
    },
    {
      id: 35,
      question: 'What is the largest organ in the human body?',
      options: ['Heart', 'Liver', 'Skin', 'Brain'],
      correctAnswer: 2,
      category: 'Biology'
    },
    {
      id: 36,
      question: 'What blood type is the universal donor?',
      options: ['A+', 'B+', 'AB+', 'O-'],
      correctAnswer: 3,
      category: 'Biology'
    },
    {
      id: 37,
      question: 'What is the basic unit of life?',
      options: ['Atom', 'Molecule', 'Cell', 'Organ'],
      correctAnswer: 2,
      category: 'Biology'
    },
    {
      id: 38,
      question: 'What is the study of fungi called?',
      options: ['Botany', 'Zoology', 'Mycology', 'Ecology'],
      correctAnswer: 2,
      category: 'Biology'
    },
    {
      id: 39,
      question: 'What is the normal human body temperature in Celsius?',
      options: ['35°C', '36°C', '37°C', '38°C'],
      correctAnswer: 2,
      category: 'Biology'
    },
    {
      id: 40,
      question: 'Which vitamin is produced when skin is exposed to sunlight?',
      options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'],
      correctAnswer: 2,
      category: 'Biology'
    }
  ],
  'Computer Science': [
    {
      id: 41,
      question: 'Which programming paradigm does Python primarily support?',
      options: ['Functional', 'Object-Oriented', 'Procedural', 'All of the above'],
      correctAnswer: 3,
      category: 'Computer Science'
    },
    {
      id: 42,
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
      correctAnswer: 0,
      category: 'Computer Science'
    },
    {
      id: 43,
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      category: 'Computer Science'
    },
    {
      id: 44,
      question: 'What is the base of the binary number system?',
      options: ['2', '8', '10', '16'],
      correctAnswer: 0,
      category: 'Computer Science'
    },
    {
      id: 45,
      question: 'What does CPU stand for?',
      options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Computer Processing Unit'],
      correctAnswer: 0,
      category: 'Computer Science'
    },
    {
      id: 46,
      question: 'Which data structure uses LIFO?',
      options: ['Queue', 'Stack', 'Tree', 'Graph'],
      correctAnswer: 1,
      category: 'Computer Science'
    },
    {
      id: 47,
      question: 'What is the output of 5 // 2 in Python?',
      options: ['2.5', '2', '3', '2.0'],
      correctAnswer: 1,
      category: 'Computer Science'
    },
    {
      id: 48,
      question: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Query Language', 'Standard Question Language', 'System Query Language'],
      correctAnswer: 0,
      category: 'Computer Science'
    },
    {
      id: 49,
      question: 'What is the smallest unit of data in a computer?',
      options: ['Bit', 'Byte', 'Nibble', 'Word'],
      correctAnswer: 0,
      category: 'Computer Science'
    },
    {
      id: 50,
      question: 'Which sorting algorithm has the best average case time complexity?',
      options: ['Bubble Sort', 'Selection Sort', 'Quick Sort', 'Insertion Sort'],
      correctAnswer: 2,
      category: 'Computer Science'
    }
  ],
  'History': [
    {
      id: 51,
      question: 'In which year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: 2,
      category: 'History'
    },
    {
      id: 52,
      question: 'Who was the first President of the United States?',
      options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
      correctAnswer: 1,
      category: 'History'
    },
    {
      id: 53,
      question: 'What year did the Berlin Wall fall?',
      options: ['1987', '1988', '1989', '1990'],
      correctAnswer: 2,
      category: 'History'
    },
    {
      id: 54,
      question: 'Who was known as the "Father of Modern Physics"?',
      options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
      correctAnswer: 1,
      category: 'History'
    },
    {
      id: 55,
      question: 'Which ancient civilization built the pyramids?',
      options: ['Romans', 'Greeks', 'Egyptians', 'Mayans'],
      correctAnswer: 2,
      category: 'History'
    },
    {
      id: 56,
      question: 'In which year did India gain independence?',
      options: ['1945', '1946', '1947', '1948'],
      correctAnswer: 2,
      category: 'History'
    },
    {
      id: 57,
      question: 'Who discovered America?',
      options: ['Christopher Columbus', 'Amerigo Vespucci', 'Leif Erikson', 'Ferdinand Magellan'],
      correctAnswer: 0,
      category: 'History'
    },
    {
      id: 58,
      question: 'What was the Renaissance?',
      options: ['A war', 'A cultural movement', 'A disease', 'A trade route'],
      correctAnswer: 1,
      category: 'History'
    },
    {
      id: 59,
      question: 'Who wrote "The Communist Manifesto"?',
      options: ['Vladimir Lenin', 'Joseph Stalin', 'Karl Marx', 'Leon Trotsky'],
      correctAnswer: 2,
      category: 'History'
    },
    {
      id: 60,
      question: 'What year did the French Revolution begin?',
      options: ['1776', '1789', '1799', '1804'],
      correctAnswer: 1,
      category: 'History'
    }
  ],
  'Geography': [
    {
      id: 61,
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      category: 'Geography'
    },
    {
      id: 62,
      question: 'Which is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 3,
      category: 'Geography'
    },
    {
      id: 63,
      question: 'What is the longest river in the world?',
      options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
      correctAnswer: 1,
      category: 'Geography'
    },
    {
      id: 64,
      question: 'Which country has the most population?',
      options: ['India', 'United States', 'China', 'Indonesia'],
      correctAnswer: 2,
      category: 'Geography'
    },
    {
      id: 65,
      question: 'What is the smallest country in the world?',
      options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
      correctAnswer: 1,
      category: 'Geography'
    },
    {
      id: 66,
      question: 'Which continent is the Sahara Desert located in?',
      options: ['Asia', 'Australia', 'Africa', 'South America'],
      correctAnswer: 2,
      category: 'Geography'
    },
    {
      id: 67,
      question: 'What is the highest mountain in the world?',
      options: ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'],
      correctAnswer: 2,
      category: 'Geography'
    },
    {
      id: 68,
      question: 'How many continents are there?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2,
      category: 'Geography'
    },
    {
      id: 69,
      question: 'Which country is known as the Land of the Rising Sun?',
      options: ['China', 'Japan', 'Korea', 'Thailand'],
      correctAnswer: 1,
      category: 'Geography'
    },
    {
      id: 70,
      question: 'What is the capital of Australia?',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
      correctAnswer: 2,
      category: 'Geography'
    }
  ],
  'Literature': [
    {
      id: 71,
      question: 'Who wrote "Romeo and Juliet"?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correctAnswer: 1,
      category: 'Literature'
    },
    {
      id: 72,
      question: 'Who wrote "1984"?',
      options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'H.G. Wells'],
      correctAnswer: 0,
      category: 'Literature'
    },
    {
      id: 73,
      question: 'What is the first book in the Harry Potter series?',
      options: ['Chamber of Secrets', 'Prisoner of Azkaban', 'Philosopher\'s Stone', 'Goblet of Fire'],
      correctAnswer: 2,
      category: 'Literature'
    },
    {
      id: 74,
      question: 'Who wrote "Pride and Prejudice"?',
      options: ['Emily Brontë', 'Charlotte Brontë', 'Jane Austen', 'Mary Shelley'],
      correctAnswer: 2,
      category: 'Literature'
    },
    {
      id: 75,
      question: 'What is the longest word in English?',
      options: ['Antidisestablishmentarianism', 'Pneumonoultramicroscopicsilicovolcanoconiosis', 'Supercalifragilisticexpialidocious', 'Floccinaucinihilipilification'],
      correctAnswer: 1,
      category: 'Literature'
    },
    {
      id: 76,
      question: 'Who wrote "To Kill a Mockingbird"?',
      options: ['Harper Lee', 'John Steinbeck', 'F. Scott Fitzgerald', 'Ernest Hemingway'],
      correctAnswer: 0,
      category: 'Literature'
    },
    {
      id: 77,
      question: 'What is a haiku?',
      options: ['A type of novel', 'A Japanese poem', 'A writing style', 'A literary device'],
      correctAnswer: 1,
      category: 'Literature'
    },
    {
      id: 78,
      question: 'Who wrote "The Great Gatsby"?',
      options: ['Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck', 'William Faulkner'],
      correctAnswer: 1,
      category: 'Literature'
    },
    {
      id: 79,
      question: 'What literary device compares two things using "like" or "as"?',
      options: ['Metaphor', 'Simile', 'Personification', 'Alliteration'],
      correctAnswer: 1,
      category: 'Literature'
    },
    {
      id: 80,
      question: 'Who wrote "Hamlet"?',
      options: ['Christopher Marlowe', 'William Shakespeare', 'Ben Jonson', 'John Milton'],
      correctAnswer: 1,
      category: 'Literature'
    }
  ]
}

export function getQuestionsBySubject(subject: string): Question[] {
  return QUIZ_QUESTIONS_BY_SUBJECT[subject] || []
}

export function getAllSubjects(): string[] {
  return Object.keys(QUIZ_QUESTIONS_BY_SUBJECT)
}
