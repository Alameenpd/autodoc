import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getProject } from '@/services/ProjectService';
import { LinkRepoForm } from '@/components/LinkRepoForm';
import { DocSettings } from '@/components/DocSettings';
import { AuthWrapper } from '@/components/AuthWrapper';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <AuthWrapper>
      <div>
        <h1 className="text-3xl font-bold mb-8">{project.name}</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.description}</p>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Linked Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {project.repositories.map((repo) => (
                <li key={repo.id} className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{repo.name}</span>
                    <div>
                      <Button variant="outline" className="mr-2" onClick={() => window.open((repo as any).url, '_blank')}>
                        View on GitHub
                      </Button>
                      <Link href={`/repositories/${repo.id}/docs`} passHref>
                        <Button variant="outline">View Docs</Button>
                      </Link>
                    </div>
                  </div>
                  <DocSettings
                    repositoryId={repo.id}
                    initialConfig={repo.customConfig || { ignore: [] } as any}
                    onSave={async (config) => {
                      await fetch(`/api/repositories/${repo.id}/doc-settings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(config),
                      });
                      // You might want to add some UI feedback here
                    }}
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Link New Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkRepoForm projectId={project.id} onSuccess={() => { /* TODO: Implement refresh logic */ }} />
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  );
}