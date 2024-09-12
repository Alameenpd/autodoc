'use client'
import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface EnhancedDocViewerProps {
  document: {
    id: string;
    title: string;
    content: string;
    repositoryId: string;
  };
  onRegenerateClick: () => void;
}

export function EnhancedDocViewer({ document, onRegenerateClick }: EnhancedDocViewerProps) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{document.title}</h1>
        <div>
          <Button onClick={() => router.push(`/repositories/${document.repositoryId}`)} className="mr-2">
            Back to Repository
          </Button>
          <Button onClick={onRegenerateClick}>Regenerate Documentation</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documentation Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                code: ({ node, ...props }) => 
                  
                    <code className="block bg-gray-100 dark:bg-gray-800 rounded p-4 mb-4" {...props} />
                  
              }}
            >
              {document.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}