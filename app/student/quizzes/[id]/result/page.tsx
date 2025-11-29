'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './result.module.css';

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [quizId]);

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/result`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        router.push('/student/quizzes');
      }
    } catch (error) {
      console.error('Error fetching result:', error);
      router.push('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className={styles.container}>Result not found</div>;
  }

  const percentage = ((result.attempt.score / result.quiz.totalMarks) * 100).toFixed(1);
  const correctCount = result.questionResults.filter((q: any) => q.isCorrect).length;

  return (
    <div className={styles.container}>
      <button onClick={() => router.push('/student/quizzes')} className={styles.backBtn}>
        ← Back to Quizzes
      </button>

      <div className={styles.header}>
        <h1>{result.quiz.title}</h1>
        <p className={styles.courseName}>
          {result.quiz.course.code} - {result.quiz.course.name}
        </p>
      </div>

      <div className={styles.scoreCard}>
        <div className={`${styles.scoreCircle} ${result.passed ? styles.passed : styles.failed}`}>
          <div className={styles.scoreValue}>{result.attempt.score}</div>
          <div className={styles.scoreTotal}>out of {result.quiz.totalMarks}</div>
        </div>

        <div className={styles.scoreDetails}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Percentage:</span>
            <span className={styles.scoreNumber}>{percentage}%</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Correct Answers:</span>
            <span className={styles.scoreNumber}>
              {correctCount}/{result.questionResults.length}
            </span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Passing Marks:</span>
            <span className={styles.scoreNumber}>{result.quiz.passingMarks}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Status:</span>
            <span className={`${styles.statusBadge} ${result.passed ? styles.passedBadge : styles.failedBadge}`}>
              {result.passed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Detailed Results</h2>
        <div className={styles.questionsList}>
          {result.questionResults.map((qr: any, idx: number) => (
            <div key={qr.questionId} className={styles.questionResult}>
              <div className={styles.questionHeader}>
                <div>
                  <span className={styles.questionNumber}>Q{idx + 1}</span>
                  <span className={`${styles.resultBadge} ${qr.isCorrect ? styles.correct : styles.incorrect}`}>
                    {qr.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <span className={styles.marks}>
                  {qr.marksAwarded}/{qr.totalMarks} marks
                </span>
              </div>

              <p className={styles.questionText}>{qr.text}</p>

              <div className={styles.optionsList}>
                {qr.options.map((option: string, optIdx: number) => {
                  const isCorrect = optIdx === qr.correctAnswer;
                  const isSelected = optIdx === qr.studentAnswer;

                  return (
                    <div
                      key={optIdx}
                      className={`${styles.option} ${
                        isCorrect ? styles.correctOption : 
                        isSelected ? styles.wrongOption : ''
                      }`}
                    >
                      <span className={styles.optionLabel}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className={styles.optionText}>{option}</span>
                      {isCorrect && (
                        <span className={styles.correctMark}>✓ Correct Answer</span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className={styles.wrongMark}>Your Answer</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
