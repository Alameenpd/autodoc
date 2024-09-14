import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { setupWebhook } from '@/lib/setupWebhook';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  try {
    const { repoId } = await request.json();
    const projectId = params.id;

    // Fetch repo details from GitHub
    const repoResponse = await fetch(`https://api.github.com/repositories/${repoId}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!repoResponse.ok) {
      throw new Error('Failed to fetch repository details from GitHub');
    }

    const repoData = await repoResponse.json();

    // Create repository in database
    const repository = await prisma.repository.create({
      data: {
        name: repoData.name,
        fullName: repoData.full_name,
        private: repoData.private,
        projectId,
      },
    });


    await setupWebhook(repository.id, session.accessToken);

    return NextResponse.json(repository);
  } catch (error) {
    console.error('Error linking repository:', error);
    return NextResponse.json({ error: 'Error linking repository' }, { status: 500 });
  }
}