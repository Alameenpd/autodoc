import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    // First, ensure the user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);

    // Check if the error is a PrismaClientKnownRequestError and has a P2003 code
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
  }
}
