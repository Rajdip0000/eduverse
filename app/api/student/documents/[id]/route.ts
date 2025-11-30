import { NextRequest, NextResponse } from "next/server";
import { getSessionWithRole } from "@/lib/auth-utils";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/student/documents/[id] - Get specific document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = session.user.id;

    const document = await prisma.document.findFirst({
      where: { id, userId: studentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}

// PUT /api/student/documents/[id] - Update document metadata
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = session.user.id;
    const body = await req.json();
    const { title, category } = body;

    const document = await prisma.document.findFirst({
      where: { id, userId: studentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(category && { category }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

// DELETE /api/student/documents/[id] - Delete document
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = session.user.id;

    const document = await prisma.document.findFirst({
      where: { id, userId: studentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
