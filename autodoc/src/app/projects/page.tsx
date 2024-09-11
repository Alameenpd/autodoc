import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getProjects } from '@/services/projectService';
import { AuthWrapper } from '@/components/AuthWrapper';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <AuthWrapper>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <Link href="/projects/new" passHref>
            <Button>Create New Project</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${project.id}`} passHref>
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AuthWrapper>
  );
}