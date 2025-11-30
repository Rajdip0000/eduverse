'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './teachers.module.css'

interface Teacher {
  id: string
  name: string
  email: string
  teacherDepartments: {
    department: {
      id: string
      name: string
      code: string
    }
  }[]
  coursesTeaching: {
    id: string
    name: string
    code: string
    _count: {
      enrollments: number
    }
  }[]
}

export default function TeachersPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in')
    } else if (session?.user?.role !== 'institute') {
      router.push('/')
    }
  }, [session, isPending, router])

  useEffect(() => {
    const fetchTeachers = async () => {
      if (session?.user?.role !== 'institute') return

      try {
        const response = await fetch('/api/institute/teachers')
        if (response.ok) {
          const data = await response.json()
          setTeachers(data)
        }
      } catch (error) {
        console.error('Failed to fetch teachers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [session])

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacherDepartments.some(td =>
      td.department.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (loading || isPending) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading teachers...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>Teachers</h1>
            <p className={styles.subtitle}>View all teaching staff</p>
          </div>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{teachers.length}</div>
            <div className={styles.statLabel}>Total Teachers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {teachers.reduce((sum, t) => sum + t.coursesTeaching.length, 0)}
            </div>
            <div className={styles.statLabel}>Active Courses</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {teachers.reduce((sum, t) => 
                sum + t.coursesTeaching.reduce((s, c) => s + c._count.enrollments, 0), 0
              )}
            </div>
            <div className={styles.statLabel}>Total Students</div>
          </div>
        </div>

        <div className={styles.teachersGrid}>
          {filteredTeachers.length === 0 ? (
            <div className={styles.empty}>
              {searchTerm ? 'No teachers found matching your search.' : 'No teachers found.'}
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <div key={teacher.id} className={styles.teacherCard}>
                <div className={styles.teacherHeader}>
                  <div className={styles.avatar}>
                    {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className={styles.teacherInfo}>
                    <h3>{teacher.name}</h3>
                    <p className={styles.email}>{teacher.email}</p>
                  </div>
                </div>

                <div className={styles.departments}>
                  <div className={styles.sectionLabel}>Departments</div>
                  {teacher.teacherDepartments.length > 0 ? (
                    <div className={styles.badges}>
                      {teacher.teacherDepartments.map((td) => (
                        <span key={td.department.id} className={styles.deptBadge}>
                          {td.department.code}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noDept}>No department assigned</p>
                  )}
                </div>

                <div className={styles.courses}>
                  <div className={styles.sectionLabel}>
                    Courses ({teacher.coursesTeaching.length})
                  </div>
                  {teacher.coursesTeaching.length > 0 ? (
                    <div className={styles.coursesList}>
                      {teacher.coursesTeaching.slice(0, 3).map((course) => (
                        <div key={course.id} className={styles.courseItem}>
                          <div className={styles.courseName}>
                            <span className={styles.courseCode}>{course.code}</span>
                            {course.name}
                          </div>
                          <div className={styles.enrollments}>
                            {course._count.enrollments} students
                          </div>
                        </div>
                      ))}
                      {teacher.coursesTeaching.length > 3 && (
                        <div className={styles.moreText}>
                          +{teacher.coursesTeaching.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className={styles.noCourses}>No courses assigned</p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.totalStudents}>
                    <strong>
                      {teacher.coursesTeaching.reduce((sum, c) => sum + c._count.enrollments, 0)}
                    </strong>{' '}
                    total students
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
