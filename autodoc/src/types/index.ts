export interface DocGenerationStats {
    totalDocs: number;
    lastGenerated: string;
    averageGenerationTime: number;
  }
  
  export interface DocGenerationHistory {
    date: string;
    docsGenerated: number;
    generationTime: number;
  }
  