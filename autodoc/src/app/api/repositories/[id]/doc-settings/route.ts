import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const repositoryId = params.id;

  try {
    const body = await request.json();
    const { ignore } = body;

    const updatedRepo = await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        customConfig: {
          ignore,
        },
      },
    });

    return NextResponse.json(updatedRepo);
  } catch (error) {
    console.error('Error saving documentation settings:', error);
    return NextResponse.json({ error: 'Error saving documentation settings' }, { status: 500 });
  }
}