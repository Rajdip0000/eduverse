'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './quizzes.module.css';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
  _count?: {
    questions: number;
    attempts: number;
  };
}

export default function TeacherQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    startTime: '',
    endTime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/teacher/quizzes');
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

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/teacher/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newQuiz = await res.json();
        setQuizzes([newQuiz, ...quizzes]);
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          courseId: '',
          duration: 30,
          totalMarks: 100,
          passingMarks: 40,
          startTime: '',
          endTime: '',
        });
        // Redirect to quiz detail to add questions
        router.push(`/teacher/quizzes/${newQuiz.id}`);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No limit';
    return new Date(dateString).toLocaleString();
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
        <h1>Quiz Management</h1>
        <button onClick={() => setShowModal(true)} className={styles.createBtn}>
          Create Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className={styles.empty}>
          <p>No quizzes created yet. Create your first quiz to get started!</p>
        </div>
      ) : (
        <div className={styles.quizGrid}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className={styles.quizCard}>
              <div className={styles.cardHeader}>
                <h3>{quiz.title}</h3>
                <span className={styles.courseBadge}>{quiz.course.code}</span>
              </div>
              
              {quiz.description && (
                <p className={styles.description}>{quiz.description}</p>
              )}

              <div className={styles.quizStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Questions:</span>
                  <span className={styles.statValue}>{quiz._count?.questions || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Attempts:</span>
                  <span className={styles.statValue}>{quiz._count?.attempts || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Duration:</span>
                  <span className={styles.statValue}>{quiz.duration} min</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Marks:</span>
                  <span className={styles.statValue}>{quiz.totalMarks}</span>
                </div>
              </div>

              <div className={styles.timeInfo}>
                <div>
                  <strong>Start:</strong> {formatDate(quiz.startTime)}
                </div>
                <div>
                  <strong>End:</strong> {formatDate(quiz.endTime)}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button 
                  onClick={() => router.push(`/teacher/quizzes/${quiz.id}`)}
                  className={styles.viewBtn}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Quiz</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Quiz Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Course *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                >
                  <option value="">Select a course</option>
                  {courses && courses.length > 0 ? (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>No courses available</option>
                  )}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Passing Marks *</label>
                <input
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) || 0 })}
                  min="0"
                  max={formData.totalMarks}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Start Time (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>End Time (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
