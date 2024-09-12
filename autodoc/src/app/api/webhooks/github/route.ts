import { NextResponse } from 'next/server';
import { DocGenerationService } from '@/services/docGenerationService';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const payload = await request.json();
  const githubEvent = request.headers.get('X-GitHub-Event');

  if (githubEvent !== 'push') {
    return NextResponse.json({ message: 'Ignored event' }, { status: 200 });
  }

  const repoFullName = payload.repository.full_name;

  try {
    const repository = await prisma.repository.findFirst({
      where: { fullName: repoFullName },
      include: { project: { include: { user: true } } },
    });

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const user = repository.project.user;
    const accessToken = await prisma.account.findFirst({
      where: { userId: user.id, provider: 'github' },
      select: { access_token: true },
    });

    if (!accessToken) {
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 404 });
    }

    const docService = new DocGenerationService((accessToken as any).access_token);
    await docService.generateAndSaveDocumentation(repository.id);

    return NextResponse.json({ message: 'Documentation updated successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}