import React from 'react';
import { NewProjectForm } from '@/components/ProjectForm';

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <NewProjectForm />
    </div>
  );
}