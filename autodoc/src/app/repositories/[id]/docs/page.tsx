import React from 'react';
import { prisma } from '@/lib/prisma';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

async function getDocumentation(repositoryId: string) {
  const document = await prisma.document.findFirst({
    where: { repositoryId },
    orderBy: { createdAt: 'desc' },
    include: { repository: true },
  });

  return document;
}

export default async function DocViewerPage({ params }: { params: { id: string } }) {
  const document = await getDocumentation(params.id);

  if (!document) {
    return <div>No documentation found for this repository.</div>;
  }

  return (
    <AuthWrapper>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{document.title}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Documentation for {document.repository.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <ReactMarkdown>{document.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4">
          <Button
            onClick={async () => {
              await fetch(`/api/repositories/${params.id}/generate-docs`, { method: 'POST' });
              // You might want to add some UI feedback here and refresh the page
            }}
          >
            Regenerate Documentation
          </Button>
        </div>
      </div>
    </AuthWrapper>
  );
}