'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { sessionAtom } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './notices.module.css';

interface Notice {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  publishToAll: boolean;
  course: {
    id: string;
    name: string;
    code: string;
  } | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function StudentNoticesPage() {
  const [{ data: session, isPending }] = useAtom(sessionAtom);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
      return;
    }

    if (session?.user) {
      fetchNotices();
    }
  }, [session, isPending]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  const courses = Array.from(
    new Set(
      notices
        .filter(n => n.course)
        .map(n => JSON.stringify({ id: n.course!.id, name: n.course!.name, code: n.course!.code }))
    )
  ).map(str => JSON.parse(str));

  const filteredNotices = selectedCourse === 'all'
    ? notices
    : notices.filter(n => n.course?.id === selectedCourse || n.publishToAll);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Notices & Announcements</h1>
          <p>Stay updated with important information from your courses</p>
        </div>

        {/* Filter */}
        <div className={styles.filterSection}>
          <label htmlFor="courseFilter">Filter by Course:</label>
          <select 
            id="courseFilter"
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Notices</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>

        {/* Notices List */}
        <div className={styles.noticesSection}>
          {filteredNotices.length === 0 ? (
            <div className={styles.empty}>
              <p>No notices found</p>
            </div>
          ) : (
            <div className={styles.noticesList}>
              {filteredNotices.map(notice => (
                <div key={notice.id} className={styles.noticeCard}>
                  <div className={styles.noticeHeader}>
                    <div className={styles.noticeTitle}>
                      <h2>{notice.title}</h2>
                      <div className={styles.noticeMeta}>
                        {notice.publishToAll ? (
                          <span className={styles.badge} style={{ backgroundColor: '#3b82f6' }}>
                            All Courses
                          </span>
                        ) : notice.course && (
                          <span className={styles.badge} style={{ backgroundColor: '#8b5cf6' }}>
                            {notice.course.name}
                          </span>
                        )}
                        <span className={styles.date}>{formatDate(notice.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.noticeContent}>
                    <p>{notice.content}</p>
                  </div>

                  <div className={styles.noticeFooter}>
                    <div className={styles.author}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{notice.author.name}</span>
                    </div>
                    {notice.course && !notice.publishToAll && (
                      <span className={styles.courseCode}>{notice.course.code}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
