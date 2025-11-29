import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { completed, title, description, priority, dueDate } = body

    const todo = await prisma.todo.findUnique({
      where: { id: params.id }
    })

    if (!todo || todo.userId !== user.id) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: params.id },
      data: {
        ...(completed !== undefined && { completed }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null })
      }
    })

    return NextResponse.json({ todo: updatedTodo })
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const todo = await prisma.todo.findUnique({
      where: { id: params.id }
    })

    if (!todo || todo.userId !== user.id) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    await prisma.todo.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}
