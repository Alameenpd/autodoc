import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // TODO: Get the user ID from the authenticated session
    const userId = 'dummy-user-id';

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
  }
}