'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './quiz-detail.module.css';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface Attempt {
  id: string;
  score: number;
  submittedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export default function QuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'attempts'>('questions');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 10,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        router.push('/teacher/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 10,
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
    });
    setShowQuestionModal(true);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.text || questionForm.options.some(opt => !opt.trim())) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingQuestion
        ? `/api/teacher/questions/${editingQuestion.id}`
        : `/api/teacher/quizzes/${quizId}/questions`;
      
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionForm),
      });

      if (res.ok) {
        await fetchQuiz();
        setShowQuestionModal(false);
      }
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/teacher/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchQuiz();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
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

  return (
    <div className={styles.container}>
      <button onClick={() => router.push('/teacher/quizzes')} className={styles.backBtn}>
        ← Back to Quizzes
      </button>

      <div className={styles.header}>
        <div>
          <h1>{quiz.title}</h1>
          <p className={styles.courseName}>{quiz.course.code} - {quiz.course.name}</p>
        </div>
      </div>

      {quiz.description && (
        <p className={styles.description}>{quiz.description}</p>
      )}

      <div className={styles.quizInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Duration:</span>
          <span className={styles.infoValue}>{quiz.duration} minutes</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Total Marks:</span>
          <span className={styles.infoValue}>{quiz.totalMarks}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Passing Marks:</span>
          <span className={styles.infoValue}>{quiz.passingMarks}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Questions:</span>
          <span className={styles.infoValue}>{quiz.questions.length}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Attempts:</span>
          <span className={styles.infoValue}>{quiz.attempts.length}</span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'questions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions ({quiz.questions.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'attempts' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('attempts')}
        >
          Student Attempts ({quiz.attempts.length})
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className={styles.questionsTab}>
          <div className={styles.tabHeader}>
            <h2>Questions</h2>
            <button onClick={handleAddQuestion} className={styles.addBtn}>
              Add Question
            </button>
          </div>

          {quiz.questions.length === 0 ? (
            <div className={styles.empty}>
              <p>No questions added yet. Add your first question!</p>
            </div>
          ) : (
            <div className={styles.questionsList}>
              {quiz.questions.map((q: Question, idx: number) => (
                <div key={q.id} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>Q{idx + 1}</span>
                    <span className={styles.questionMarks}>{q.marks} marks</span>
                  </div>
                  <p className={styles.questionText}>{q.text}</p>
                  <div className={styles.optionsList}>
                    {q.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`${styles.option} ${optIdx === q.correctAnswer ? styles.correctOption : ''}`}
                      >
                        <span className={styles.optionLabel}>{String.fromCharCode(65 + optIdx)}.</span>
                        {option}
                        {optIdx === q.correctAnswer && (
                          <span className={styles.correctBadge}>✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.questionActions}>
                    <button onClick={() => handleEditQuestion(q)} className={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className={styles.deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'attempts' && (
        <div className={styles.attemptsTab}>
          <h2>Student Attempts</h2>
          
          {quiz.attempts.length === 0 ? (
            <div className={styles.empty}>
              <p>No student attempts yet.</p>
            </div>
          ) : (
            <div className={styles.attemptsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {quiz.attempts.map((attempt: Attempt) => {
                    const percentage = ((attempt.score / quiz.totalMarks) * 100).toFixed(1);
                    const passed = attempt.score >= quiz.passingMarks;

                    return (
                      <tr key={attempt.id}>
                        <td>{attempt.student.name}</td>
                        <td>{attempt.student.email}</td>
                        <td>{attempt.score}/{quiz.totalMarks}</td>
                        <td>{percentage}%</td>
                        <td>
                          <span className={`${styles.statusBadge} ${passed ? styles.passed : styles.failed}`}>
                            {passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td>{new Date(attempt.submittedAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showQuestionModal && (
        <div className={styles.modalOverlay} onClick={() => setShowQuestionModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingQuestion ? 'Edit Question' : 'Add Question'}</h2>
            <form onSubmit={handleSubmitQuestion}>
              <div className={styles.formGroup}>
                <label>Question Text *</label>
                <textarea
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Options *</label>
                {questionForm.options.map((option, idx) => (
                  <div key={idx} className={styles.optionInput}>
                    <span className={styles.optionLabel}>{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Correct Answer *</label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: parseInt(e.target.value) })}
                    required
                  >
                    {questionForm.options.map((_, idx) => (
                      <option key={idx} value={idx}>
                        Option {String.fromCharCode(65 + idx)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Marks *</label>
                  <input
                    type="number"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowQuestionModal(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? 'Saving...' : (editingQuestion ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
