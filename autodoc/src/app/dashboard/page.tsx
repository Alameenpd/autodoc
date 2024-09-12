import React from 'react';
import { DocGenerationDashboard } from '@/components/DocGenerationDashboard';
import { DocGenerationStats, DocGenerationHistory } from '@/types';

const stats: DocGenerationStats = {
  totalDocs: 50,
  lastGenerated: '2024-09-10T12:34:56Z',
  averageGenerationTime: 3.45,
};

const history: DocGenerationHistory[] = [
  { date: '2024-09-09', docsGenerated: 5, generationTime: 4.0 },
  { date: '2024-09-08', docsGenerated: 10, generationTime: 3.5 },
  { date: '2024-09-07', docsGenerated: 8, generationTime: 3.8 },
];

export default function DashboardPage() {
  const handleRegenerateClick = () => {
    // Logic to regenerate documentation
    console.log('Regenerate Documentation clicked');
  };

  return ( 
     <div>Dashboard Page</div>
    
  );
}