import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documentation Generation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Total Documents</p>
              <p className="text-2xl font-bold">{stats.totalDocs}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Generated</p>
              <p className="text-2xl font-bold">{new Date(stats.lastGenerated).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Avg. Generation Time</p>
              <p className="text-2xl font-bold">{stats.averageGenerationTime.toFixed(2)}s</p>
            </div>
          </div>
        </CardContent>
      </Card>

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