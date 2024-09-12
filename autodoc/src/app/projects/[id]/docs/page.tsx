import React from 'react';
import { prisma } from '@/lib/prisma';
import { AuthWrapper } from '@/components/AuthWrapper';
import { EnhancedDocViewer } from '@/components/DocViewer';

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

  const handleRegenerateDoc = async () => {
    await fetch(`/api/repositories/${params.id}/generate-docs`, { method: 'POST' });
    // You might want to add some UI feedback here and refresh the page
  };

  return (
    <AuthWrapper>
      <EnhancedDocViewer 
        document={document}
        onRegenerateClick={handleRegenerateDoc}
      />
    </AuthWrapper>
  );
}