export type ExportFormat = 'pdf' | 'docx' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeQualityScore?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface ExportLesson {
  id: string;
  title: string;
  topic: string;
  subject: string;
  grade: number;
  content: unknown;
  metadata?: unknown;
  qualityScore?: number;
  createdAt: Date;
  createdBy: string;
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  fileName: string;
  size?: number;
  url?: string;
  error?: string;
}
