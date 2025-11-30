'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { sessionAtom } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

interface DashboardData {
  stats: {
    totalTeachers: number;
    totalStudents: number;
    totalCourses: number;
    totalDepartments: number;
  };
  recentCourses: Array<{
    id: string;
    name: string;
    code: string;
    teacher: { name: string; email: string };
    _count: { enrollments: number; assignments: number };
  }>;
  departmentStats: Array<{
    id: string;
    name: string;
    code: string;
    _count: { teachers: number; courses: number };
  }>;
}

export default function InstitutePage() {
  const [{ data: session, isPending }] = useAtom(sessionAtom);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
      return;
    }

    if (session?.user?.role !== 'institute') {
      router.push('/');
      return;
    }

    if (session?.user) {
      fetchDashboard();
    }
  }, [session, isPending]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/institute/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
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
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Institute Dashboard</h1>
          <p>Welcome back, {session?.user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #3b82f6' }}>
            <h3>Total Teachers</h3>
            <p className={styles.statValue}>{dashboardData?.stats.totalTeachers || 0}</p>
          </div>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #10b981' }}>
            <h3>Total Students</h3>
            <p className={styles.statValue}>{dashboardData?.stats.totalStudents || 0}</p>
          </div>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #8b5cf6' }}>
            <h3>Total Courses</h3>
            <p className={styles.statValue}>{dashboardData?.stats.totalCourses || 0}</p>
          </div>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #f59e0b' }}>
            <h3>Departments</h3>
            <p className={styles.statValue}>{dashboardData?.stats.totalDepartments || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actionsGrid}>
          <button onClick={() => router.push('/institute/departments')} className={styles.actionBtn}>
            Manage Departments
          </button>
          <button onClick={() => router.push('/institute/teachers')} className={styles.actionBtn}>
            View Teachers
          </button>
          <button onClick={() => router.push('/institute/announcements')} className={styles.actionBtn}>
            Announcements
          </button>
        </div>

        {/* Department Stats */}
        <div className={styles.section}>
          <h2>Departments Overview</h2>
          <div className={styles.cardsGrid}>
            {dashboardData?.departmentStats.map(dept => (
              <div key={dept.id} className={styles.deptCard}>
                <h3>{dept.name}</h3>
                <p className={styles.deptCode}>{dept.code}</p>
                <div className={styles.deptStats}>
                  <span>{dept._count.teachers} Teachers</span>
                  <span>{dept._count.courses} Courses</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Courses */}
        <div className={styles.section}>
          <h2>Recent Courses</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Teacher</th>
                  <th>Enrollments</th>
                  <th>Assignments</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentCourses.map(course => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td>{course.code}</td>
                    <td>{course.teacher.name}</td>
                    <td>{course._count.enrollments}</td>
                    <td>{course._count.assignments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
