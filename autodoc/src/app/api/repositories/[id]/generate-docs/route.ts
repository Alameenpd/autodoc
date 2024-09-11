import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DocGenerationService } from '@/services/docGenerationService';

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
    const docService = new DocGenerationService(session.accessToken);
    await docService.generateAndSaveDocumentation(repositoryId);

    return NextResponse.json({ message: 'Documentation generated successfully' });
  } catch (error) {
    console.error('Error generating documentation:', error);
    return NextResponse.json({ error: 'Error generating documentation' }, { status: 500 });
  }
}