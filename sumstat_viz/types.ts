
export interface PaperAnalysis {
  title: string;
  abstract: string;
  keyFindings: string[];
  methodology: {
    steps: string[];
    modelsUsed: string[];
  };
  statistics: {
    label: string;
    value: number;
    unit: string;
  }[];
  performanceData: {
    metric: string;
    score: number;
  }[];
}

export interface TableData {
  rows: Record<string, any>[];
  headers: string[];
}

export type AppView = 'overview' | 'methodology' | 'extraction' | 'results';
