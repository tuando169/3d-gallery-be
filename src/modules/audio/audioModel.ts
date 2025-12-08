export interface AudioModel {
  id: string;
  title?: string;

  file_url: string;

  metadata?: Record<string, any>;

  created_at: string;
}