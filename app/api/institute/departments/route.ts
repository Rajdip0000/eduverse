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

    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            teachers: true,
            courses: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers());

    if (!session?.user || session.user.role !== 'institute') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
      }
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

