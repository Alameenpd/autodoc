import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DocGenerationStats {
  totalDocs: number;
  lastGenerated: string;
  averageGenerationTime: number;
}

interface DocGenerationHistory {
  date: string;
  docsGenerated: number;
  generationTime: number;
}

interface DashboardProps {
  repositoryId: string;
  stats: DocGenerationStats;
  history: DocGenerationHistory[];
  onRegenerateClick: () => void;
}

export function DocGenerationDashboard({ repositoryId, stats, history, onRegenerateClick }: DashboardProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Documentation Generation Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalDocs}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Last Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{new Date(stats.lastGenerated).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg. Generation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.averageGenerationTime.toFixed(2)}s</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Generation History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="docsGenerated" fill="#8884d8" name="Docs Generated" />
              <Bar yAxisId="right" dataKey="generationTime" fill="#82ca9d" name="Generation Time (s)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Button onClick={onRegenerateClick}>Regenerate Documentation</Button>
    </div>
  );
}