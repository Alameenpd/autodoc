import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-bold mb-8">Welcome to Automated Internal Docs Builder</h1>
      <Card className="w-[350px] mb-8">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Create your first project and start generating docs</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/projects/new" passHref>
            <Button className="w-full">Create New Project</Button>
          </Link>
        </CardContent>
      </Card>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>AI-powered documentation generation</li>
            <li>GitHub integration</li>
            <li>Automatic updates on commits</li>
            <li>Multiple repository support</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}