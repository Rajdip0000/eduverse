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

    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
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
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: session.user.id
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
