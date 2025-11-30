import { NextRequest, NextResponse } from "next/server";
import { getSessionWithRole } from "@/lib/auth-utils";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/student/documents - Get all documents for student
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;

    const documents = await prisma.document.findMany({
      where: { userId: studentId },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

// POST /api/student/documents - Upload a new document
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;
    const body = await req.json();
    const { title, fileName, fileType, fileUrl, fileSize, category } = body;

    if (!title || !fileName || !fileType || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        userId: studentId,
        title,
        fileName,
        fileType,
        fileUrl,
        fileSize: fileSize || 0,
        category,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

