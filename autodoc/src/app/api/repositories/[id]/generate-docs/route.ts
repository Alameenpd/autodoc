import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DocGenerationService } from '@/services/docGenerationService';
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
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { project: { include: { user: true } } },
    });

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const accessToken = await prisma.account.findFirst({
      where: { userId: repository.project.user.id, provider: 'github' },
      select: { access_token: true },
    });

    if (!accessToken) {
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 404 });
    }

    const customConfig = repository.customConfig as { ignore?: string[]; aiEnhancement?: boolean } || {};
    const docService = new DocGenerationService(accessToken.access_token as any, customConfig);
    await docService.generateAndSaveDocumentation(repositoryId);

    return NextResponse.json({ message: 'Documentation generated successfully' });
  } catch (error) {
    console.error('Error generating documentation:', error);
    return NextResponse.json({ error: 'Error generating documentation' }, { status: 500 });
  }
}