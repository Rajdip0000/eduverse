'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './attendance.module.css';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  course: {
    id: string;
    name: string;
    code: string;
  };
}

interface CourseStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  percentage: number;
}

interface AttendanceData {
  records: AttendanceRecord[];
  courseStats: Record<string, CourseStats>;
}

export default function StudentAttendancePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
      return;
    }

    if (session?.user) {
      fetchAttendance();
    }
  }, [session, isPending]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/attendance');
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
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
          <p>Loading attendance...</p>
        </div>
      </div>
    );
  }

  const courses = attendanceData?.courseStats ? Object.keys(attendanceData.courseStats) : [];
  const filteredRecords = selectedCourse === 'all' 
    ? attendanceData?.records || []
    : attendanceData?.records.filter(r => r.course.id === selectedCourse) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return '#10b981';
      case 'LATE': return '#f59e0b';
      case 'ABSENT': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>My Attendance</h1>
          <p>Track your attendance across all courses</p>
        </div>

        {/* Course Statistics */}
        <div className={styles.statsGrid}>
          {attendanceData?.courseStats && Object.entries(attendanceData.courseStats).map(([courseId, stats]) => {
            const course = attendanceData.records.find(r => r.course.id === courseId)?.course;
            if (!course) return null;

            return (
              <div key={courseId} className={styles.statCard}>
                <h3>{course.name}</h3>
                <p className={styles.courseCode}>{course.code}</p>
                <div className={styles.percentage} style={{
                  color: stats.percentage >= 75 ? '#10b981' : stats.percentage >= 60 ? '#f59e0b' : '#ef4444'
                }}>
                  {stats.percentage.toFixed(1)}%
                </div>
                <div className={styles.breakdown}>
                  <span style={{ color: '#10b981' }}>Present: {stats.present}</span>
                  <span style={{ color: '#f59e0b' }}>Late: {stats.late}</span>
                  <span style={{ color: '#ef4444' }}>Absent: {stats.absent}</span>
                </div>
                <p className={styles.total}>Total: {stats.total} classes</p>
              </div>
            );
          })}
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
            <option value="all">All Courses</option>
            {courses.map(courseId => {
              const course = attendanceData?.records.find(r => r.course.id === courseId)?.course;
              return course ? (
                <option key={courseId} value={courseId}>
                  {course.name} ({course.code})
                </option>
              ) : null;
            })}
          </select>
        </div>

        {/* Attendance Records */}
        <div className={styles.recordsSection}>
          <h2>Attendance Records</h2>
          {filteredRecords.length === 0 ? (
            <div className={styles.empty}>
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className={styles.recordsGrid}>
              {filteredRecords.map(record => (
                <div key={record.id} className={styles.recordCard}>
                  <div className={styles.recordHeader}>
                    <h3>{record.course.name}</h3>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(record.status) }}
                    >
                      {record.status}
                    </span>
                  </div>
                  <p className={styles.courseCode}>{record.course.code}</p>
                  <p className={styles.date}>{formatDate(record.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
