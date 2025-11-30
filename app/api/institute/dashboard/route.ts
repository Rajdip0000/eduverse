import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithRole } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers());

    if (!session?.user || session.user.role !== 'institute') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get statistics
    const [
      totalTeachers,
      totalStudents,
      totalCourses,
      totalDepartments,
      recentCourses,
      departmentStats
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'teacher' }
      }),
      prisma.user.count({
        where: { role: 'student' }
      }),
      prisma.course.count(),
      prisma.department.count(),
      prisma.course.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            select: { name: true, email: true }
          },
          _count: {
            select: {
              enrollments: true,
              assignments: true
            }
          }
        }
      }),
      prisma.department.findMany({
        include: {
          _count: {
            select: {
              teachers: true,
              courses: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalTeachers,
        totalStudents,
        totalCourses,
        totalDepartments
      },
      recentCourses,
      departmentStats
    });
  } catch (error) {
    console.error('Error fetching institute dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

