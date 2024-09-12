import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const repositoryId = params.id;

  try {
    const documents = await prisma.document.findMany({
      where: { repositoryId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Last 30 documents for history
    });

    const stats = {
      totalDocs: documents.length,
      lastGenerated: documents[0]?.createdAt.toISOString() || null,
      averageGenerationTime: 0, // You'll need to add a field to track generation time
    };

    const history = documents.map(doc => ({
      date: doc.createdAt.toISOString().split('T')[0],
      docsGenerated: 1,
      generationTime: 0, // You'll need to add a field to track generation time
    }));

    return NextResponse.json({ stats, history });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Error fetching dashboard data' }, { status: 500 });
  }
}