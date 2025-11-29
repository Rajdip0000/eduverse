'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './take-quiz.module.css';

interface Question {
  id: string;
  text: string;
  options: string[];
  marks: number;
}

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz) {
      handleSubmit();
    }
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
        setTimeLeft(data.duration * 60); // Convert minutes to seconds
      } else {
        const error = await res.json();
        alert(error.error);
        router.push('/student/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      router.push('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const confirmed = confirm('Are you sure you want to submit? You cannot change your answers after submission.');
    if (!confirmed && timeLeft > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (res.ok) {
        const result = await res.json();
        router.push(`/student/quizzes/${quizId}/result`);
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return <div className={styles.container}>Quiz not found</div>;
  }

  const currentQ = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{quiz.title}</h1>
          <p className={styles.courseName}>{quiz.course.code} - {quiz.course.name}</p>
        </div>
        <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
          <span className={styles.timerIcon}>⏱️</span>
          <span className={styles.timerText}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
        <p className={styles.progressText}>
          Question {currentQuestion + 1} of {quiz.questions.length} • {answeredCount} answered
        </p>
      </div>

      <div className={styles.questionCard}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNumber}>Question {currentQuestion + 1}</span>
          <span className={styles.questionMarks}>{currentQ.marks} marks</span>
        </div>

        <p className={styles.questionText}>{currentQ.text}</p>

        <div className={styles.optionsList}>
          {currentQ.options.map((option: string, index: number) => (
            <button
              key={index}
              className={`${styles.option} ${answers[currentQ.id] === index ? styles.selectedOption : ''}`}
              onClick={() => handleAnswerSelect(currentQ.id, index)}
            >
              <span className={styles.optionLabel}>{String.fromCharCode(65 + index)}</span>
              <span className={styles.optionText}>{option}</span>
              {answers[currentQ.id] === index && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.navigation}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={styles.navBtn}
        >
          ← Previous
        </button>

        <div className={styles.questionDots}>
          {quiz.questions.map((q: Question, idx: number) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(idx)}
              className={`${styles.dot} ${idx === currentQuestion ? styles.activeDot : ''} ${answers[q.id] !== undefined ? styles.answeredDot : ''}`}
              title={`Question ${idx + 1}`}
            />
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button onClick={handleNext} className={styles.navBtn}>
            Next →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className={styles.submitBtn}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
