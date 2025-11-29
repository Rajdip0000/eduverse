import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// DELETE - Delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: quizId, questionId } = await params;

    // Verify teacher owns the quiz
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, teacherId: session.user.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found or unauthorized' }, { status: 404 });
    }

    await prisma.quizQuestion.delete({
      where: { id: questionId, quizId },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
