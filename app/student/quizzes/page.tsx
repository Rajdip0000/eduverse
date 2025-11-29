'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './quizzes.module.css';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startTime: string | null;
  endTime: string | null;
  status: string;
  course: {
    title: string;
    code: string;
  };
  teacher: {
    name: string;
  };
  _count: {
    questions: number;
  };
  yourAttempt: {
    id: string;
    score: number;
    submittedAt: string;
  } | null;
}

export default function StudentQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'completed' | 'upcoming'>('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/student/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === 'all') return true;
    return quiz.status === filter;
  });

  const handleTakeQuiz = (quizId: string) => {
    router.push(`/student/quizzes/${quizId}`);
  };

  const handleViewResult = (quizId: string) => {
    router.push(`/student/quizzes/${quizId}/result`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'Available', className: styles.available },
      completed: { label: 'Completed', className: styles.completed },
      upcoming: { label: 'Upcoming', className: styles.upcoming },
      expired: { label: 'Expired', className: styles.expired },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    return <span className={`${styles.statusBadge} ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Available Quizzes</h1>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({quizzes.length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'available' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('available')}
        >
          Available ({quizzes.filter(q => q.status === 'available').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'completed' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({quizzes.filter(q => q.status === 'completed').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'upcoming' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming ({quizzes.filter(q => q.status === 'upcoming').length})
        </button>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className={styles.empty}>
          <p>No quizzes found in this category.</p>
        </div>
      ) : (
        <div className={styles.quizGrid}>
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className={styles.quizCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{quiz.title}</h3>
                  <p className={styles.courseName}>{quiz.course.code} - {quiz.course.title}</p>
                </div>
                {getStatusBadge(quiz.status)}
              </div>

              {quiz.description && (
                <p className={styles.description}>{quiz.description}</p>
              )}

              <div className={styles.quizInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>👤</span>
                  <span>{quiz.teacher.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>❓</span>
                  <span>{quiz._count.questions} Questions</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>⏱️</span>
                  <span>{quiz.duration} minutes</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🎯</span>
                  <span>{quiz.totalMarks} marks</span>
                </div>
              </div>

              {quiz.yourAttempt && (
                <div className={styles.attemptInfo}>
                  <div className={styles.attemptScore}>
                    <span className={styles.scoreLabel}>Your Score:</span>
                    <span className={styles.scoreValue}>
                      {quiz.yourAttempt.score}/{quiz.totalMarks}
                    </span>
                    <span className={`${styles.resultBadge} ${quiz.yourAttempt.score >= quiz.passingMarks ? styles.passed : styles.failed}`}>
                      {quiz.yourAttempt.score >= quiz.passingMarks ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <p className={styles.attemptDate}>
                    Submitted: {new Date(quiz.yourAttempt.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className={styles.cardActions}>
                {quiz.status === 'available' && !quiz.yourAttempt && (
                  <button onClick={() => handleTakeQuiz(quiz.id)} className={styles.takeBtn}>
                    Start Quiz
                  </button>
                )}
                {quiz.status === 'completed' && quiz.yourAttempt && (
                  <button onClick={() => handleViewResult(quiz.id)} className={styles.viewResultBtn}>
                    View Results
                  </button>
                )}
                {quiz.status === 'upcoming' && (
                  <div className={styles.upcomingInfo}>
                    Starts: {quiz.startTime && new Date(quiz.startTime).toLocaleString()}
                  </div>
                )}
                {quiz.status === 'expired' && (
                  <div className={styles.expiredInfo}>
                    Quiz ended
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
